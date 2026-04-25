package com.apex.payment.repository;

import com.apex.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByMemberId(Long memberId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByPaymentType(Payment.PaymentType type);
    List<Payment> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.memberId = :memberId")
    BigDecimal getTotalRevenueByMember(Long memberId);
}
