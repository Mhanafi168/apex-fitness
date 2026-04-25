package com.apex.payment.dto;

import com.apex.payment.entity.Payment;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {

    private Long id;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentType;
    private String description;
    private String transactionReference;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .memberId(p.getMemberId())
                .memberName(p.getMemberName())
                .memberEmail(p.getMemberEmail())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .paymentType(p.getPaymentType() != null ? p.getPaymentType().name() : null)
                .description(p.getDescription())
                .transactionReference(p.getTransactionReference())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
