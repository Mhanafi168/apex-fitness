package com.apex.trainer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gym_classes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GymClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private String location;

    @Column(nullable = false)
    private Long trainerId;

    private String trainerName;

    @Column(nullable = false)
    private LocalDateTime classDateTime;

    private Integer durationMinutes;
    private Integer maxCapacity;
    private Integer currentEnrollment;

    @Enumerated(EnumType.STRING)
    private ClassStatus status;

    @Enumerated(EnumType.STRING)
    private ClassType classType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ClassStatus.SCHEDULED;
        if (currentEnrollment == null) currentEnrollment = 0;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum ClassStatus { SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED }
    public enum ClassType   { YOGA, PILATES, HIIT, STRENGTH, CARDIO, SPINNING, BOXING, ZUMBA, OTHER }
}
