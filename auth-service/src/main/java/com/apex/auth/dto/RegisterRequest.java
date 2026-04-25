package com.apex.auth.dto;

import com.apex.auth.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Valid email required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String fullName;
    private String phoneNumber;
    private User.Role role = User.Role.MEMBER;
}
