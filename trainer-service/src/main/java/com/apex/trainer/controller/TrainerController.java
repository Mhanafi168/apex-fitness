package com.apex.trainer.controller;

import com.apex.trainer.dto.*;
import com.apex.trainer.entity.*;
import com.apex.trainer.service.TrainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService trainerService;

    // ── Trainer endpoints ─────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerResponse> createTrainer(@Valid @RequestBody TrainerRequest req) {
        Trainer trainer = Trainer.builder()
                .userId(req.getUserId())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .specialization(req.getSpecialization())
                .bio(req.getBio())
                .experienceYears(req.getExperienceYears())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TrainerResponse.from(trainerService.createTrainer(trainer)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainerResponse>> getAllTrainers() {
        return ResponseEntity.ok(trainerService.getAllTrainers().stream()
                .map(TrainerResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/active")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<TrainerResponse>> getActiveTrainers() {
        return ResponseEntity.ok(trainerService.getActiveTrainers().stream()
                .map(TrainerResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<TrainerResponse> getTrainerById(@PathVariable Long id) {
        return ResponseEntity.ok(TrainerResponse.from(trainerService.getTrainerById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<TrainerResponse> getTrainerByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(TrainerResponse.from(trainerService.getTrainerByUserId(userId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<TrainerResponse> updateTrainer(
            @PathVariable Long id, @RequestBody TrainerRequest req) {
        Trainer updated = Trainer.builder()
                .fullName(req.getFullName())
                .phoneNumber(req.getPhoneNumber())
                .specialization(req.getSpecialization())
                .bio(req.getBio())
                .experienceYears(req.getExperienceYears())
                .build();
        return ResponseEntity.ok(TrainerResponse.from(trainerService.updateTrainer(id, updated)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerResponse> updateStatus(
            @PathVariable Long id, @RequestParam Trainer.TrainerStatus status) {
        return ResponseEntity.ok(TrainerResponse.from(trainerService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTrainer(@PathVariable Long id) {
        trainerService.deleteTrainer(id);
        return ResponseEntity.noContent().build();
    }

    // ── Class endpoints ───────────────────────────────────────────────────────

    @PostMapping("/classes")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassRequest req) {
        GymClass gymClass = GymClass.builder()
                .name(req.getName())
                .description(req.getDescription())
                .location(req.getLocation())
                .trainerId(req.getTrainerId())
                .classDateTime(req.getClassDateTime())
                .durationMinutes(req.getDurationMinutes())
                .maxCapacity(req.getMaxCapacity())
                .classType(req.getClassType())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ClassResponse.from(trainerService.createClass(gymClass)));
    }

    @GetMapping("/classes")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        return ResponseEntity.ok(trainerService.getAllClasses().stream()
                .map(ClassResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/classes/upcoming")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ClassResponse>> getUpcomingClasses() {
        return ResponseEntity.ok(trainerService.getUpcomingClasses().stream()
                .map(ClassResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/classes/type/{type}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ClassResponse>> getClassesByType(@PathVariable GymClass.ClassType type) {
        return ResponseEntity.ok(trainerService.getClassesByType(type).stream()
                .map(ClassResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/classes/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable Long id) {
        return ResponseEntity.ok(ClassResponse.from(trainerService.getClassById(id)));
    }

    @GetMapping("/{trainerId}/classes")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<List<ClassResponse>> getClassesByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(trainerService.getClassesByTrainer(trainerId).stream()
                .map(ClassResponse::from).collect(Collectors.toList()));
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable Long id, @RequestBody ClassRequest req) {
        GymClass updated = GymClass.builder()
                .name(req.getName())
                .description(req.getDescription())
                .location(req.getLocation())
                .classDateTime(req.getClassDateTime())
                .durationMinutes(req.getDurationMinutes())
                .maxCapacity(req.getMaxCapacity())
                .classType(req.getClassType())
                .build();
        return ResponseEntity.ok(ClassResponse.from(trainerService.updateClass(id, updated)));
    }

    @PutMapping("/classes/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
    public ResponseEntity<ClassResponse> cancelClass(@PathVariable Long id) {
        return ResponseEntity.ok(ClassResponse.from(trainerService.cancelClass(id)));
    }

    // Internal endpoints called by member-service (no auth needed)
    @PutMapping("/classes/{id}/enroll")
    public ResponseEntity<ClassResponse> incrementEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(ClassResponse.from(trainerService.incrementEnrollment(id)));
    }

    @PutMapping("/classes/{id}/unenroll")
    public ResponseEntity<ClassResponse> decrementEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(ClassResponse.from(trainerService.decrementEnrollment(id)));
    }
}
