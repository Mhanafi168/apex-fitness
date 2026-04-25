package com.apex.member.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private Long classId;        // references trainer-service

    private String className;
    private String trainerName;
    private LocalDateTime classDateTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private String notes;

    @PrePersist
    protected void onCreate() {
        bookedAt = LocalDateTime.now();
        if (status == null) status = BookingStatus.CONFIRMED;
    }

    public enum BookingStatus { CONFIRMED, CANCELLED, ATTENDED, NO_SHOW }
}
