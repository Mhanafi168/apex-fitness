package com.apex.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long startTime = System.currentTimeMillis();

        log.info("[GATEWAY] → {} {} | from: {}",
                request.getMethod(),
                request.getPath(),
                request.getRemoteAddress());

        return chain.filter(exchange)
                .doFinally(signalType -> {
                    ServerHttpResponse response = exchange.getResponse();
                    long elapsed = System.currentTimeMillis() - startTime;
                    log.info("[GATEWAY] ← {} {} | status: {} | {}ms",
                            request.getMethod(),
                            request.getPath(),
                            response.getStatusCode(),
                            elapsed);
                });
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
