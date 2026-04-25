package com.apex.gateway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;

@Component
@Slf4j
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.secret}")
    private String secret;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().pathWithinApplication().value();
            if ("/api/auth/register".equals(path) || "/api/auth/login".equals(path)) {
                return chain.filter(exchange);
            }

            if (HttpMethod.GET.equals(request.getMethod())) {
                if ("/api/trainers/active".equals(path)
                        || path.startsWith("/api/trainers/classes")
                        || path.matches("/api/trainers/\\d+")
                        || "/api/payments/plans/active".equals(path)) {
                    return chain.filter(exchange);
                }
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();
                String role     = claims.get("role", String.class);

                // Forward user info as headers to downstream services
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-Auth-Username", username)
                        .header("X-Auth-Role", role)
                        .build();

                log.debug("[GATEWAY] Routing {} {} | user={} role={}",
                        request.getMethod(), request.getPath(), username, role);

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (ExpiredJwtException e) {
                log.warn("[GATEWAY] Expired token for path: {}", request.getPath());
                return onError(exchange, "Token has expired", HttpStatus.UNAUTHORIZED);
            } catch (JwtException e) {
                log.warn("[GATEWAY] Invalid token for path: {} - {}", request.getPath(), e.getMessage());
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        var buffer = response.bufferFactory()
                .wrap(("{\"error\":\"" + message + "\",\"status\":" + status.value() + "}").getBytes());
        return response.writeWith(Mono.just(buffer));
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public static class Config {
        // No additional config needed — token validation is always on
    }
}
