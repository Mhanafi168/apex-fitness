package com.apex.auth.controller;

import com.apex.auth.dto.*;
import com.apex.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        return ResponseEntity.ok("Token is valid");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader("X-Auth-Username") String username) {
        return ResponseEntity.ok(authService.getUserByUsername(username));
    }

    // ── Admin only ────────────────────────────────────────────────────────────

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PutMapping("/admin/users/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        authService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
