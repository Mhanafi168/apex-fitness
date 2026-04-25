package com.apex.trainer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trainers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phoneNumber;
    private String specialization;
    private String bio;
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    private TrainerStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = TrainerStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum TrainerStatus { ACTIVE, INACTIVE, ON_LEAVE }
}
