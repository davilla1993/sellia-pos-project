package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.model.AuditLog;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogResponse {

    private String publicId;
    private String userEmail;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime actionDate;
    private AuditLog.ActionStatus status;
    private String errorMessage;
    private LocalDateTime createdAt;

    public static AuditLogResponse fromEntity(AuditLog auditLog) {
        AuditLogResponse response = new AuditLogResponse();
        response.setPublicId(auditLog.getPublicId());
        response.setUserEmail(auditLog.getUserEmail());
        response.setAction(auditLog.getAction());
        response.setEntityType(auditLog.getEntityType());
        response.setEntityId(auditLog.getEntityId());
        response.setDetails(auditLog.getDetails());
        response.setIpAddress(auditLog.getIpAddress());
        response.setUserAgent(auditLog.getUserAgent());
        response.setActionDate(auditLog.getActionDate());
        response.setStatus(auditLog.getStatus());
        response.setErrorMessage(auditLog.getErrorMessage());
        response.setCreatedAt(auditLog.getCreatedAt());
        return response;
    }
}
