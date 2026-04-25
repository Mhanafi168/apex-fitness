package com.apex.trainer.dto;

import com.apex.trainer.entity.GymClass;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassRequest {

    @NotBlank(message = "Class name is required")
    private String name;

    private String description;
    private String location;

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    @NotNull(message = "Class date/time is required")
    private LocalDateTime classDateTime;

    private Integer durationMinutes;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer maxCapacity;

    private GymClass.ClassType classType;
}
