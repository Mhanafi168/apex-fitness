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
public class PaymentApiClient {

    private final RestTemplate restTemplate;

    @Value("${apex.payment-service.base-url:http://localhost:8085}")
    private String paymentBaseUrl;

    private String base() {
        String b = paymentBaseUrl == null ? "" : paymentBaseUrl.trim();
        return b.endsWith("/") ? b.substring(0, b.length() - 1) : b;
    }

    /**
     * Check if a member has made a completed CLASS_BOOKING payment.
     * @return true if member has active payment for class booking, false otherwise
     */
    public boolean hasMemberPaidForClassBooking(Long memberId) {
        String url = base() + "/api/payments/member/" + memberId + "/has-class-payment";
        try {
            ResponseEntity<Map> res = restTemplate.getForEntity(url, Map.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                log.debug("Payment service returned no payment check response for member {}", memberId);
                return false;
            }
            Object hasPayment = res.getBody().get("hasPayment");
            if (hasPayment instanceof Boolean) {
                return (Boolean) hasPayment;
            }
            return false;
        } catch (RestClientException e) {
            log.warn("Payment service check failed for member {}: {}", memberId, e.getMessage());
            throw new IllegalStateException("Unable to verify payment status");
        }
    }

    /**
     * Get member's last completed CLASS_BOOKING payment.
     * @return timestamp of last payment or 0 if none found
     */
    public Long getMemberLastClassPaymentTime(Long memberId) {
        String url = base() + "/api/payments/member/" + memberId + "/last-class-payment-time";
        try {
            ResponseEntity<Map> res = restTemplate.getForEntity(url, Map.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                return 0L;
            }
            Object timestamp = res.getBody().get("timestamp");
            if (timestamp instanceof Number) {
                return ((Number) timestamp).longValue();
            }
            return 0L;
        } catch (RestClientException e) {
            log.debug("Could not retrieve last payment time for member {}: {}", memberId, e.getMessage());
            return 0L;
        }
    }
}
