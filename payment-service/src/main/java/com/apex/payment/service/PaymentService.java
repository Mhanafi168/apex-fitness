package com.apex.payment.service;

import com.apex.payment.entity.*;
import com.apex.payment.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MembershipPlanRepository planRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    // ── Payments ──────────────────────────────────────────────────────────────

    @Transactional
    public Payment processPayment(Payment payment) {
        // Simulate payment gateway — in production integrate Stripe/PayPal here
        payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);
        log.info("[PAYMENT] Processed payment {} for member {} amount {}{}",
                saved.getTransactionReference(), saved.getMemberId(),
                saved.getCurrency(), saved.getAmount());
        return saved;
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + id));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByMember(Long memberId) {
        return paymentRepository.findByMemberId(memberId);
    }

    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    public List<Payment> getPaymentsByDateRange(LocalDateTime from, LocalDateTime to) {
        return paymentRepository.findByCreatedAtBetween(from, to);
    }

    @Transactional
    public Payment refundPayment(Long id) {
        Payment payment = getPaymentById(id);
        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Only completed payments can be refunded");
        }
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }

    public BigDecimal getTotalRevenue() {
        BigDecimal total = paymentRepository.getTotalRevenue();
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getMemberTotalSpend(Long memberId) {
        BigDecimal total = paymentRepository.getTotalRevenueByMember(memberId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // ── Membership Plans ──────────────────────────────────────────────────────

    @Transactional
    public MembershipPlan createPlan(MembershipPlan plan) {
        return planRepository.save(plan);
    }

    public List<MembershipPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<MembershipPlan> getActivePlans() {
        return planRepository.findByActiveTrue();
    }

    public MembershipPlan getPlanById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + id));
    }

    @Transactional
    public MembershipPlan updatePlan(Long id, MembershipPlan updated) {
        MembershipPlan existing = getPlanById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setDurationDays(updated.getDurationDays());
        existing.setClassesIncluded(updated.getClassesIncluded());
        existing.setPersonalTrainingIncluded(updated.getPersonalTrainingIncluded());
        return planRepository.save(existing);
    }

    @Transactional
    public void deactivatePlan(Long id) {
        MembershipPlan plan = getPlanById(id);
        plan.setActive(false);
        planRepository.save(plan);
    }

    // ── Payment Methods ───────────────────────────────────────────────────────

    @Transactional
    public PaymentMethod createPaymentMethod(PaymentMethod method) {
        return paymentMethodRepository.save(method);
    }

    public List<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.findAll();
    }

    public List<PaymentMethod> getActivePaymentMethods() {
        return paymentMethodRepository.findByIsActiveTrueOrderByDisplayOrder();
    }

    public PaymentMethod getPaymentMethodById(Long id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + id));
    }

    public PaymentMethod getPaymentMethodByCode(String code) {
        return paymentMethodRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + code));
    }

    @Transactional
    public PaymentMethod updatePaymentMethod(Long id, PaymentMethod updated) {
        PaymentMethod existing = getPaymentMethodById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setIcon(updated.getIcon());
        existing.setIsActive(updated.getIsActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setType(updated.getType());
        return paymentMethodRepository.save(existing);
    }

    @Transactional
    public void deactivatePaymentMethod(Long id) {
        PaymentMethod method = getPaymentMethodById(id);
        method.setIsActive(false);
        paymentMethodRepository.save(method);
    }
}
