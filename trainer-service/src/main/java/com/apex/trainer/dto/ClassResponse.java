package com.apex.trainer.dto;

import com.apex.trainer.entity.GymClass;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassResponse {

    private Long id;
    private String name;
    private String description;
    private String location;
    private Long trainerId;
    private String trainerName;
    private LocalDateTime classDateTime;
    private Integer durationMinutes;
    private Integer maxCapacity;
    private Integer currentEnrollment;
    private Integer spotsAvailable;
    private String status;
    private String classType;
    private LocalDateTime createdAt;

    public static ClassResponse from(GymClass c) {
        int spots = (c.getMaxCapacity() != null && c.getCurrentEnrollment() != null)
                ? c.getMaxCapacity() - c.getCurrentEnrollment() : 0;
        return ClassResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .location(c.getLocation())
                .trainerId(c.getTrainerId())
                .trainerName(c.getTrainerName())
                .classDateTime(c.getClassDateTime())
                .durationMinutes(c.getDurationMinutes())
                .maxCapacity(c.getMaxCapacity())
                .currentEnrollment(c.getCurrentEnrollment())
                .spotsAvailable(spots)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .classType(c.getClassType() != null ? c.getClassType().name() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
