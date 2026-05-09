package com.apex.payment.controller;

import com.apex.payment.dto.*;
import com.apex.payment.entity.*;
import com.apex.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ── Payment endpoints ─────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest req) {
        Payment payment = Payment.builder()
                .memberId(req.getMemberId())
                .memberName(req.getMemberName())
                .memberEmail(req.getMemberEmail())
                .planId(req.getPlanId())
                .planName(req.getPlanName())
                .relatedClassId(req.getRelatedClassId())
                .amount(req.getAmount())
                .currency(req.getCurrency() != null ? req.getCurrency() : "USD")
                .paymentType(req.getPaymentType())
                .description(req.getDescription())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PaymentResponse.from(paymentService.processPayment(payment)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments().stream()
                .map(PaymentResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(PaymentResponse.from(paymentService.getPaymentById(id)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(paymentService.getPaymentsByMember(memberId).stream()
                .map(PaymentResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(
            @PathVariable Payment.PaymentStatus status) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status).stream()
                .map(PaymentResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(from, to).stream()
                .map(PaymentResponse::from).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long id) {
        return ResponseEntity.ok(PaymentResponse.from(paymentService.refundPayment(id)));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRevenueSummary() {
        return ResponseEntity.ok(paymentService.getRevenueSummary());
    }

    @GetMapping("/revenue/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<Map<String, BigDecimal>> getMemberSpend(@PathVariable Long memberId) {
        return ResponseEntity.ok(Map.of("totalSpend", paymentService.getMemberTotalSpend(memberId)));
    }

    // ── Membership Plan endpoints ─────────────────────────────────────────────

    @PostMapping("/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlan> createPlan(@Valid @RequestBody PlanRequest req) {
        MembershipPlan plan = MembershipPlan.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .durationDays(req.getDurationDays())
                .classesIncluded(req.getClassesIncluded())
                .personalTrainingIncluded(req.getPersonalTrainingIncluded())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPlan(plan));
    }

    @GetMapping("/plans")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TRAINER')")
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(paymentService.getAllPlans());
    }

    @GetMapping("/plans/active")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<MembershipPlan>> getActivePlans() {
        return ResponseEntity.ok(paymentService.getActivePlans());
    }

    @GetMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TRAINER')")
    public ResponseEntity<MembershipPlan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPlanById(id));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlan> updatePlan(
            @PathVariable Long id, @Valid @RequestBody PlanRequest req) {
        MembershipPlan plan = MembershipPlan.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .durationDays(req.getDurationDays())
                .classesIncluded(req.getClassesIncluded())
                .personalTrainingIncluded(req.getPersonalTrainingIncluded())
                .build();
        return ResponseEntity.ok(paymentService.updatePlan(id, plan));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivatePlan(@PathVariable Long id) {
        paymentService.deactivatePlan(id);
        return ResponseEntity.noContent().build();
    }

    // ── Payment Methods endpoints ────────────────────────────────────────────

    @PostMapping("/methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(@RequestBody PaymentMethod method) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PaymentMethodResponse.from(paymentService.createPaymentMethod(method)));
    }

    @GetMapping("/methods")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TRAINER')")
    public ResponseEntity<List<PaymentMethodResponse>> getAllPaymentMethods() {
        return ResponseEntity.ok(paymentService.getAllPaymentMethods().stream()
                .map(PaymentMethodResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/methods/active")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<PaymentMethodResponse>> getActivePaymentMethods() {
        return ResponseEntity.ok(paymentService.getActivePaymentMethods().stream()
                .map(PaymentMethodResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/methods/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TRAINER')")
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodById(@PathVariable Long id) {
        return ResponseEntity.ok(PaymentMethodResponse.from(paymentService.getPaymentMethodById(id)));
    }

    @GetMapping("/methods/code/{code}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodByCode(@PathVariable String code) {
        return ResponseEntity.ok(PaymentMethodResponse.from(paymentService.getPaymentMethodByCode(code)));
    }

    @PutMapping("/methods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable Long id, @RequestBody PaymentMethod method) {
        return ResponseEntity.ok(PaymentMethodResponse.from(paymentService.updatePaymentMethod(id, method)));
    }

    @DeleteMapping("/methods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivatePaymentMethod(@PathVariable Long id) {
        paymentService.deactivatePaymentMethod(id);
        return ResponseEntity.noContent().build();
    }

    // ── Class Booking Payment Check endpoints ────────────────────────────────

    /**
     * Check if member has made a completed CLASS_BOOKING payment.
     * Used by member-service to validate payment before allowing class booking.
     */
    @GetMapping("/member/{memberId}/has-class-payment")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> hasClassPayment(@PathVariable Long memberId) {
        boolean hasPayment = paymentService.hasMemberCompletedClassPayment(memberId);
        return ResponseEntity.ok(Map.of("hasPayment", hasPayment, "memberId", memberId));
    }

    /**
     * Get the timestamp of member's last completed CLASS_BOOKING payment.
     * Used to check how recent the payment is.
     */
    @GetMapping("/member/{memberId}/last-class-payment-time")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getLastClassPaymentTime(@PathVariable Long memberId) {
        Long timestamp = paymentService.getLastClassPaymentTime(memberId);
        return ResponseEntity.ok(Map.of(
                "timestamp", timestamp != null ? timestamp : 0L,
                "memberId", memberId
        ));
    }
}
