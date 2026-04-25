package com.apex.payment.dto;

import com.apex.payment.entity.PaymentMethod;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentMethodResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String icon;
    private Boolean isActive;
    private Integer displayOrder;
    private String type;

    public static PaymentMethodResponse from(PaymentMethod method) {
        return PaymentMethodResponse.builder()
                .id(method.getId())
                .code(method.getCode())
                .name(method.getName())
                .description(method.getDescription())
                .icon(method.getIcon())
                .isActive(method.getIsActive())
                .displayOrder(method.getDisplayOrder())
                .type(method.getType() != null ? method.getType().toString() : null)
                .build();
    }
}
