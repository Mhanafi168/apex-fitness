package com.apex.member.config;

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
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
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
                            .setSigningKey(getKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

                    String username = claims.getSubject();
                    String role     = claims.get("role", String.class);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        var auth = new UsernamePasswordAuthenticationToken(
                                username, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                } catch (JwtException e) {
                    log.warn("JWT validation failed: {}", e.getMessage());
                }
            }
            chain.doFilter(req, res);
        }

        private Key getKey() {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        }
    }
}
