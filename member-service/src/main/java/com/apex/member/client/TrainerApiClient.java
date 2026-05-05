package com.apex.member.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrainerApiClient {

    private final RestTemplate restTemplate;

    @Value("${apex.trainer-service.base-url:http://localhost:8083}")
    private String trainerBaseUrl;

    private String base() {
        String b = trainerBaseUrl == null ? "" : trainerBaseUrl.trim();
        return b.endsWith("/") ? b.substring(0, b.length() - 1) : b;
    }

    /** Public trainer-service endpoint — no auth required. */
    public Long getTrainerIdOwningClass(Long classId) {
        String url = base() + "/api/trainers/classes/" + classId;
        try {
            ResponseEntity<Map> res = restTemplate.getForEntity(url, Map.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                throw new IllegalStateException("Trainer service returned no class payload");
            }
            return extractLong(res.getBody(), "trainerId");
        } catch (RestClientException e) {
            log.warn("Trainer service class lookup failed for {}: {}", classId, e.getMessage());
            throw new IllegalStateException("Unable to load class from trainer service");
        }
    }

    /** Requires a trainer JWT (forwarded from the browser). */
    public Long getTrainerRecordIdForUser(Long userId, String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalStateException("Missing bearer token for trainer lookup");
        }
        String url = base() + "/api/trainers/user/" + userId;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                throw new IllegalStateException("Trainer service returned no trainer payload");
            }
            return extractLong(res.getBody(), "id");
        } catch (RestClientException e) {
            log.warn("Trainer service user lookup failed for {}: {}", userId, e.getMessage());
            throw new IllegalStateException("Unable to resolve trainer profile");
        }
    }

    @SuppressWarnings("unchecked")
    private static Long extractLong(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        return null;
    }
}
