package com.apex.trainer.repository;

import com.apex.trainer.entity.GymClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GymClassRepository extends JpaRepository<GymClass, Long> {
    List<GymClass> findByTrainerId(Long trainerId);
    List<GymClass> findByStatus(GymClass.ClassStatus status);
    List<GymClass> findByClassType(GymClass.ClassType classType);
    List<GymClass> findByClassDateTimeBetween(LocalDateTime from, LocalDateTime to);

    List<GymClass> findTop20ByStatusOrderByClassDateTimeDesc(GymClass.ClassStatus status);

    List<GymClass> findByTrainerIdAndStatus(Long trainerId, GymClass.ClassStatus status);
}
