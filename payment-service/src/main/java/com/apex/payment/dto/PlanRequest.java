package com.apex.payment.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanRequest {

    @NotBlank(message = "Plan name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;

    private Integer durationDays;
    private Integer classesIncluded;
    private Boolean personalTrainingIncluded = false;
}
