package com.apex.member.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Class ID is required")
    private Long classId;

    private String className;
    private String trainerName;
    private LocalDateTime classDateTime;
    private String notes;
}
