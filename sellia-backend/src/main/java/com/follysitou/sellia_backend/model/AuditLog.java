package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_user_email", columnList = "userEmail"),
        @Index(name = "idx_action_date", columnList = "actionDate"),
        @Index(name = "idx_entity_type", columnList = "entityType")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {
    private String userEmail;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    private String entityId;

    @Column(length = 2000)
    private String details;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime actionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionStatus status;

    @Column(length = 1000)
    private String errorMessage;

    public enum ActionStatus {
        SUCCESS,
        FAILED
    }
}

