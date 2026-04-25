package com.apex.trainer.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainerRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    private String phoneNumber;
    private String specialization;
    private String bio;
    private Integer experienceYears;
}
