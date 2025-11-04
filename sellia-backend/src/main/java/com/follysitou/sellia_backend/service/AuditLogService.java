package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.AuditLog;
import com.follysitou.sellia_backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log a successful action
     */
    @Transactional
    public void logSuccess(String userEmail, String action, String entityType, String entityId, String details) {
        AuditLog auditLog = buildAuditLog(userEmail, action, entityType, entityId, details, AuditLog.ActionStatus.SUCCESS, null);
        auditLogRepository.save(auditLog);
        log.info("Audit log saved: {} - {} - {}", userEmail, action, entityType);
    }

    /**
     * Log a failed action
     */
    @Transactional
    public void logFailure(String userEmail, String action, String entityType, String entityId, String details, String errorMessage) {
        AuditLog auditLog = buildAuditLog(userEmail, action, entityType, entityId, details, AuditLog.ActionStatus.FAILED, errorMessage);
        auditLogRepository.save(auditLog);
        log.warn("Audit log saved (FAILED): {} - {} - {} - {}", userEmail, action, entityType, errorMessage);
    }

    /**
     * Log a generic action with custom status
     */
    @Transactional
    public void log(String userEmail, String action, String entityType, String entityId, String details, AuditLog.ActionStatus status, String errorMessage) {
        AuditLog auditLog = buildAuditLog(userEmail, action, entityType, entityId, details, status, errorMessage);
        auditLogRepository.save(auditLog);
    }

    /**
     * Build an audit log entry
     */
    private AuditLog buildAuditLog(String userEmail, String action, String entityType, String entityId, String details, AuditLog.ActionStatus status, String errorMessage) {
        String ipAddress = getClientIpAddress();
        String userAgent = getClientUserAgent();

        return AuditLog.builder()
                .userEmail(userEmail != null ? userEmail : "ANONYMOUS")
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .actionDate(LocalDateTime.now())
                .status(status)
                .errorMessage(errorMessage)
                .build();
    }

    /**
     * Get client IP address
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.warn("Could not get client IP address", e);
        }
        return "unknown";
    }

    /**
     * Get client User-Agent
     */
    private String getClientUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String userAgent = request.getHeader("User-Agent");
                if (userAgent != null && userAgent.length() > 500) {
                    return userAgent.substring(0, 500);
                }
                return userAgent != null ? userAgent : "unknown";
            }
        } catch (Exception e) {
            log.warn("Could not get client user agent", e);
        }
        return "unknown";
    }
}
