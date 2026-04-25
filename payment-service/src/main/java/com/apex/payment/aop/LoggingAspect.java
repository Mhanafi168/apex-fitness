package com.apex.payment.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.apex.payment.service..*(..)) || execution(* com.apex.payment.controller..*(..))")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        String sig = pjp.getSignature().toShortString();
        long t = System.currentTimeMillis();
        try {
            Object r = pjp.proceed();
            log.debug("[PAYMENT] {} completed in {}ms", sig, System.currentTimeMillis() - t);
            return r;
        } catch (Exception ex) {
            log.error("[PAYMENT] {} threw {}: {}", sig, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }

    @AfterReturning("execution(* com.apex.payment.service.PaymentService.processPayment(..))")
    public void auditPayment(JoinPoint jp) {
        log.info("[AUDIT] Payment processed");
    }
}