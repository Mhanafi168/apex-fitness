package com.apex.member.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect @Component @Slf4j
public class LoggingAspect {

    @Around("execution(* com.apex.member.service..*(..)) || execution(* com.apex.member.controller..*(..))")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        String sig = pjp.getSignature().toShortString();
        long t = System.currentTimeMillis();
        try {
            Object r = pjp.proceed();
            log.debug("[MEMBER] {} completed in {}ms", sig, System.currentTimeMillis() - t);
            return r;
        } catch (Exception ex) {
            log.error("[MEMBER] {} threw {}: {}", sig, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }

    @AfterReturning("execution(* com.apex.member.service.MemberService.bookClass(..))")
    public void auditBooking() {
        log.info("[AUDIT] New class booking created");
    }
}
