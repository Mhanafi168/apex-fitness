package com.apex.trainer.dto;

import com.apex.trainer.entity.Trainer;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainerResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String specialization;
    private String bio;
    private Integer experienceYears;
    private String status;
    private LocalDateTime createdAt;

    public static TrainerResponse from(Trainer t) {
        return TrainerResponse.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .fullName(t.getFullName())
                .email(t.getEmail())
                .phoneNumber(t.getPhoneNumber())
                .specialization(t.getSpecialization())
                .bio(t.getBio())
                .experienceYears(t.getExperienceYears())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
