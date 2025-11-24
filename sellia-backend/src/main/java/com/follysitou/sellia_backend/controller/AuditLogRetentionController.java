package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.service.AuditLogRetentionService;
import com.follysitou.sellia_backend.service.AuditLogRetentionService.ArchiveResult;
import com.follysitou.sellia_backend.service.AuditLogRetentionService.RetentionConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for managing audit log retention and archiving
 * Accessible only by AUDITOR role (not ADMIN)
 */
@RestController
@RequestMapping("/api/audit-logs/retention")
@RequiredArgsConstructor
@Slf4j
public class AuditLogRetentionController {

    private final AuditLogRetentionService retentionService;

    /**
     * GET /api/audit-logs/retention/config
     * Get current retention configuration
     */
    @GetMapping("/config")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<RetentionConfig> getConfig() {
        log.info("Fetching audit log retention configuration");
        return ResponseEntity.ok(retentionService.getConfig());
    }

    /**
     * POST /api/audit-logs/retention/archive
     * Manually trigger archiving and cleanup of old audit logs
     * Only accessible by AUDITOR role
     */
    @PostMapping("/archive")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, Object>> archiveNow() {
        log.info("Manual audit log archiving triggered by admin");
        try {
            ArchiveResult result = retentionService.archiveAndCleanup();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Audit logs archived and cleaned up successfully");
            response.put("archivedCount", result.archivedCount());
            response.put("deletedCount", result.deletedCount());
            response.put("archiveFile", result.archiveFile());

            log.info("Manual archiving completed: {} archived, {} deleted",
                    result.archivedCount(), result.deletedCount());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error during manual archiving", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error during archiving: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
