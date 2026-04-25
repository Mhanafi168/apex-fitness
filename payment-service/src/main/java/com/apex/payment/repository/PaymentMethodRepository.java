package com.apex.payment.repository;

import com.apex.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByIsActiveTrue();
    Optional<PaymentMethod> findByCode(String code);
    List<PaymentMethod> findByIsActiveTrueOrderByDisplayOrder();
}
