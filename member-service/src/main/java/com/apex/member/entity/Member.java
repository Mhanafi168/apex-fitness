package com.apex.member.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Member {

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
    private String address;

    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    @Enumerated(EnumType.STRING)
    private MembershipStatus status;

    private LocalDate membershipStartDate;
    private LocalDate membershipEndDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = MembershipStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MembershipType { BASIC, STANDARD, PREMIUM }
    public enum MembershipStatus { ACTIVE, INACTIVE, SUSPENDED, EXPIRED }
}
