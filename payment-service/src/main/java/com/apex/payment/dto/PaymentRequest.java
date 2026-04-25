package com.apex.payment.dto;

import com.apex.payment.entity.Payment;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    private String memberName;
    private String memberEmail;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String currency = "USD";

    @NotNull(message = "Payment type is required")
    private Payment.PaymentType paymentType;

    private String description;
}
