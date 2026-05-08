package com.apex.payment.repository;

import com.apex.payment.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    List<MembershipPlan> findByActiveTrue();

    @Query("SELECT p FROM MembershipPlan p WHERE p.active = true OR p.active IS NULL")
    List<MembershipPlan> findVisibleActivePlans();

    long countByActiveTrue();
}
