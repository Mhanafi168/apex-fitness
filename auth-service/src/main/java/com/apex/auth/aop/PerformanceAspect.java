package com.apex.auth.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class PerformanceAspect {

    private static final long SLOW_THRESHOLD_MS = 500;

    @Around("execution(* com.apex.auth.service..*(..))")
    public Object measurePerformance(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;
        if (elapsed > SLOW_THRESHOLD_MS) {
            log.warn("[PERFORMANCE] SLOW: {} took {}ms", pjp.getSignature().toShortString(), elapsed);
        }
        return result;
    }
}
