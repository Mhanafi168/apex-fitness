package com.apex.trainer.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Collection;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenFilter jwtFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/trainers/classes/*/enroll",
                                 "/api/trainers/classes/*/unenroll").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/trainers/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/trainers/classes", "/api/trainers/classes/**").permitAll()
                .requestMatchers(RegexRequestMatcher.regexMatcher(HttpMethod.GET, "/api/trainers/[0-9]+"))
                .permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Component
    @Slf4j
    static class JwtTokenFilter extends OncePerRequestFilter {

        @Value("${jwt.secret}")
        private String secret;

        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest req,
                                        @NonNull HttpServletResponse res,
                                        @NonNull FilterChain chain) throws ServletException, IOException {
            String header = req.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    String token = header.substring(7);
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(getKey()).build()
                            .parseClaimsJws(token).getBody();
                    String username = claims.getSubject();
                    String roleNorm = normalizeRoleClaim(claims);
                    if (username != null && roleNorm != null
                            && SecurityContextHolder.getContext().getAuthentication() == null) {
                        var auth = new UsernamePasswordAuthenticationToken(
                                username, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + roleNorm)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else if (username != null && roleNorm == null) {
                        log.warn("[TRAINER] JWT has no usable role claim; subject={}", username);
                    }
                } catch (JwtException e) {
                    log.warn("[TRAINER] JWT validation failed: {}", e.getMessage());
                }
            }
            chain.doFilter(req, res);
        }

        /**
         * Maps JWT role to Spring {@code ROLE_*} authorities. Handles string values, collections,
         * and normalizes case so {@code hasRole('ADMIN')} matches tokens issued with any casing.
         */
        private static String normalizeRoleClaim(Claims claims) {
            Object raw = claims.get("role");
            if (raw == null) {
                raw = claims.get("roles");
            }
            if (raw == null) {
                return null;
            }
            String s;
            if (raw instanceof String) {
                s = ((String) raw).trim();
            } else if (raw instanceof Collection<?> c && !c.isEmpty()) {
                Object first = c.iterator().next();
                s = first != null ? String.valueOf(first).trim() : "";
            } else {
                s = String.valueOf(raw).trim();
            }
            if (s.isEmpty()) {
                return null;
            }
            return s.toUpperCase();
        }

        private Key getKey() {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        }
    }
}
