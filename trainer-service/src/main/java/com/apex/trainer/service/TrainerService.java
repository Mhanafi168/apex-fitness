package com.apex.trainer.service;

import com.apex.trainer.entity.*;
import com.apex.trainer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final GymClassRepository gymClassRepository;

    // ── Trainer CRUD ──────────────────────────────────────────────────────────

    @Transactional
    public Trainer createTrainer(Trainer trainer) {
        if (trainerRepository.existsByEmail(trainer.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + trainer.getEmail());
        }
        return trainerRepository.save(trainer);
    }

    public Trainer getTrainerById(Long id) {
        return trainerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + id));
    }

    public Trainer getTrainerByUserId(Long userId) {
        return trainerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found for user: " + userId));
    }

    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    public List<Trainer> getActiveTrainers() {
        return trainerRepository.findByStatus(Trainer.TrainerStatus.ACTIVE);
    }

    @Transactional
    public Trainer updateTrainer(Long id, Trainer updated) {
        Trainer existing = getTrainerById(id);
        existing.setFullName(updated.getFullName());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setSpecialization(updated.getSpecialization());
        existing.setBio(updated.getBio());
        existing.setExperienceYears(updated.getExperienceYears());
        return trainerRepository.save(existing);
    }

    @Transactional
    public Trainer updateStatus(Long id, Trainer.TrainerStatus status) {
        Trainer trainer = getTrainerById(id);
        trainer.setStatus(status);
        return trainerRepository.save(trainer);
    }

    // ── Class Management ──────────────────────────────────────────────────────

    @Transactional
    public GymClass createClass(GymClass gymClass) {
        Trainer trainer = getTrainerById(gymClass.getTrainerId());
        gymClass.setTrainerName(trainer.getFullName());
        return gymClassRepository.save(gymClass);
    }

    public GymClass getClassById(Long id) {
        return gymClassRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + id));
    }

    public List<GymClass> getAllClasses() {
        return gymClassRepository.findAll();
    }

    public List<GymClass> getClassesByTrainer(Long trainerId) {
        return gymClassRepository.findByTrainerId(trainerId);
    }

    public List<GymClass> getUpcomingClasses() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime horizon = now.plusDays(90);
        List<GymClass> inWindow = gymClassRepository.findByClassDateTimeBetween(now, horizon).stream()
                .filter(c -> c.getStatus() != GymClass.ClassStatus.CANCELLED)
                .toList();
        if (!inWindow.isEmpty()) {
            return inWindow;
        }
        // Demo / legacy rows with past dates still show on the site until dates are updated.
        return gymClassRepository.findTop20ByStatusOrderByClassDateTimeDesc(GymClass.ClassStatus.SCHEDULED);
    }

    public List<GymClass> getClassesByType(GymClass.ClassType type) {
        return gymClassRepository.findByClassType(type);
    }

    @Transactional
    public GymClass updateClass(Long id, GymClass updated) {
        GymClass existing = getClassById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setLocation(updated.getLocation());
        existing.setClassDateTime(updated.getClassDateTime());
        existing.setDurationMinutes(updated.getDurationMinutes());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setClassType(updated.getClassType());
        return gymClassRepository.save(existing);
    }

    @Transactional
    public GymClass cancelClass(Long id) {
        GymClass gymClass = getClassById(id);
        gymClass.setStatus(GymClass.ClassStatus.CANCELLED);
        return gymClassRepository.save(gymClass);
    }

    @Transactional
    public GymClass incrementEnrollment(Long classId) {
        GymClass gymClass = getClassById(classId);
        if (gymClass.getCurrentEnrollment() >= gymClass.getMaxCapacity()) {
            throw new IllegalStateException("Class is fully booked: " + classId);
        }
        gymClass.setCurrentEnrollment(gymClass.getCurrentEnrollment() + 1);
        return gymClassRepository.save(gymClass);
    }

    @Transactional
    public GymClass decrementEnrollment(Long classId) {
        GymClass gymClass = getClassById(classId);
        if (gymClass.getCurrentEnrollment() > 0) {
            gymClass.setCurrentEnrollment(gymClass.getCurrentEnrollment() - 1);
        }
        return gymClassRepository.save(gymClass);
    }
}
