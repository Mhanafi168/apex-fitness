package com.apex.member.dto;

import com.apex.member.entity.Member;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String membershipType;
    private String status;
    private LocalDate membershipStartDate;
    private LocalDate membershipEndDate;
    private LocalDateTime createdAt;

    public static MemberResponse from(Member m) {
        return MemberResponse.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .fullName(m.getFullName())
                .email(m.getEmail())
                .phoneNumber(m.getPhoneNumber())
                .address(m.getAddress())
                .membershipType(m.getMembershipType() != null ? m.getMembershipType().name() : null)
                .status(m.getStatus() != null ? m.getStatus().name() : null)
                .membershipStartDate(m.getMembershipStartDate())
                .membershipEndDate(m.getMembershipEndDate())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
