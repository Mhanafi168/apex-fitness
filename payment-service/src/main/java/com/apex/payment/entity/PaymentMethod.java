package com.apex.payment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_methods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String icon;

    @Column(nullable = false)
    private Boolean isActive = true;

    private Integer displayOrder = 0;

    public enum PaymentMethodType {
        CARD,
        EWALLET,
        BANK_TRANSFER,
        CASH
    }

    @Enumerated(EnumType.STRING)
    private PaymentMethodType type;
}
