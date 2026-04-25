package com.apex.trainer.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.apex.trainer.service..*(..)) || execution(* com.apex.trainer.controller..*(..))")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        String sig = pjp.getSignature().toShortString();
        long t = System.currentTimeMillis();
        try {
            Object r = pjp.proceed();
            log.debug("[TRAINER] {} completed in {}ms", sig, System.currentTimeMillis() - t);
            return r;
        } catch (Exception ex) {
            log.error("[TRAINER] {} threw {}: {}", sig, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }

    @AfterReturning("execution(* com.apex.trainer.service.TrainerService.createClass(..))")
    public void auditClassCreated(JoinPoint jp) {
        log.info("[AUDIT] New gym class created");
    }
}