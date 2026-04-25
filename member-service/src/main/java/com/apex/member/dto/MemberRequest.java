package com.apex.member.dto;

import com.apex.member.entity.Member;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    private String phoneNumber;
    private String address;

    private Member.MembershipType membershipType;
    private LocalDate membershipStartDate;
    private LocalDate membershipEndDate;
}
