package com.apex.trainer.repository;

import com.apex.trainer.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    Optional<Trainer> findByUserId(Long userId);
    Optional<Trainer> findByEmail(String email);
    List<Trainer> findByStatus(Trainer.TrainerStatus status);
    boolean existsByEmail(String email);
}
