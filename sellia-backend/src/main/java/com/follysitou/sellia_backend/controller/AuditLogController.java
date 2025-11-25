package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.response.AuditLogResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.model.AuditLog;
import com.follysitou.sellia_backend.repository.AuditLogRepository;
import com.follysitou.sellia_backend.specification.AuditLogSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    /**
     * Get all audit logs with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "actionDate"));
        Page<AuditLog> auditLogs = auditLogRepository.findAll(pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Search audit logs with multiple filters
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> searchAuditLogs(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) AuditLog.ActionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "actionDate"));

        Specification<AuditLog> spec = AuditLogSpecification.searchAuditLogs(
                userEmail, entityType, status, startDate, endDate);

        Page<AuditLog> auditLogs = auditLogRepository.findAll(spec, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs by user email
     */
    @GetMapping("/user/{userEmail}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogsByUser(
            @PathVariable String userEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogRepository.findByUserEmail(userEmail, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs by action type
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogRepository.findByAction(action, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs by entity type
     */
    @GetMapping("/entity-type/{entityType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogsByEntityType(
            @PathVariable String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogRepository.findByEntityType(entityType, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs by date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogRepository.findByDateRange(startDate, endDate, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs by status (SUCCESS/FAILED)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogsByStatus(
            @PathVariable AuditLog.ActionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogRepository.findByStatus(status, pageRequest);

        Page<AuditLogResponse> responsePage = auditLogs.map(AuditLogResponse::fromEntity);
        PagedResponse<AuditLogResponse> response = PagedResponse.of(responsePage);

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs for a specific entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {

        List<AuditLog> auditLogs = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);

        List<AuditLogResponse> content = auditLogs.stream()
                .map(AuditLogResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(content);
    }

    /**
     * Get statistics about audit logs
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<AuditStatsResponse> getAuditStats() {
        long totalLogs = auditLogRepository.count();
        long successLogs = auditLogRepository.findByStatus(AuditLog.ActionStatus.SUCCESS, PageRequest.of(0, 1)).getTotalElements();
        long failedLogs = auditLogRepository.findByStatus(AuditLog.ActionStatus.FAILED, PageRequest.of(0, 1)).getTotalElements();

        AuditStatsResponse stats = new AuditStatsResponse();
        stats.setTotalLogs(totalLogs);
        stats.setSuccessLogs(successLogs);
        stats.setFailedLogs(failedLogs);
        stats.setSuccessRate(totalLogs > 0 ? (double) successLogs / totalLogs * 100 : 0);

        return ResponseEntity.ok(stats);
    }

    @lombok.Data
    public static class AuditStatsResponse {
        private long totalLogs;
        private long successLogs;
        private long failedLogs;
        private double successRate;
    }
}
