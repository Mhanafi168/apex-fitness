package com.apex.auth.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("(execution(* com.apex.auth.service..*(..)) || execution(* com.apex.auth.controller..*(..))) && !within(com.apex.auth.config..*)")
    public Object logAround(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        log.debug("-> {} ", method);
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            log.debug("<- {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("X {} | {}: {}", method, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }

    @AfterReturning(
        pointcut = "execution(* com.apex.auth.service.AuthService.login(..))",
        returning = "result"
    )
    public void auditLogin(JoinPoint jp, Object result) {
        log.info("[SECURITY-AUDIT] Successful login");
    }

    @AfterReturning("execution(* com.apex.auth.service.AuthService.register(..))")
    public void auditRegister(JoinPoint jp) {
        log.info("[SECURITY-AUDIT] New user registered");
    }
}
