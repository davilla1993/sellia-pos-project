package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.AuditLog;
import com.follysitou.sellia_backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for managing audit log retention and archiving
 * Automatically archives and deletes old audit logs based on retention policy
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogRetentionService {

    private final AuditLogRepository auditLogRepository;

    @Value("${audit.retention.days:90}")
    private int retentionDays;

    @Value("${audit.archive.enabled:true}")
    private boolean archiveEnabled;

    @Value("${audit.archive.path:archives/audit-logs}")
    private String archivePath;

    /**
     * Scheduled job that runs every Sunday at 3:00 AM
     * Archives and deletes audit logs older than retention period
     */
    @Scheduled(cron = "${audit.retention.cron:0 0 3 * * SUN}")
    public void scheduleArchiveAndCleanup() {
        log.info("Starting scheduled audit log archiving and cleanup (retention: {} days)", retentionDays);
        try {
            ArchiveResult result = archiveAndCleanup();
            log.info("Scheduled audit log cleanup completed successfully: {} archived, {} deleted",
                    result.archivedCount, result.deletedCount);
        } catch (Exception e) {
            log.error("Error during scheduled audit log cleanup", e);
        }
    }

    /**
     * Archive and cleanup audit logs (can be called manually)
     * @return ArchiveResult containing statistics
     */
    @Transactional
    public ArchiveResult archiveAndCleanup() throws IOException {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

        log.info("Searching for audit logs older than {}", cutoffDate);

        // Find logs to archive
        List<AuditLog> logsToArchive = auditLogRepository.findByActionDateBefore(cutoffDate);

        if (logsToArchive.isEmpty()) {
            log.info("No audit logs found for archiving");
            return new ArchiveResult(0, 0, null);
        }

        String archiveFile = null;
        int archivedCount = 0;
        int deletedCount = 0;

        // Archive to CSV if enabled
        if (archiveEnabled) {
            archiveFile = archiveToCSV(logsToArchive);
            archivedCount = logsToArchive.size();
            log.info("Successfully archived {} audit logs to {}", archivedCount, archiveFile);
        }

        // Delete archived logs from database
        deletedCount = auditLogRepository.deleteByActionDateBefore(cutoffDate);
        log.info("Successfully deleted {} audit logs from database", deletedCount);

        return new ArchiveResult(archivedCount, deletedCount, archiveFile);
    }

    /**
     * Archive audit logs to CSV file
     */
    private String archiveToCSV(List<AuditLog> logs) throws IOException {
        // Create archive directory if it doesn't exist
        Path archiveDir = Paths.get(archivePath);
        Files.createDirectories(archiveDir);

        // Generate filename with timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String filename = String.format("audit_logs_archive_%s.csv", timestamp);
        Path filePath = archiveDir.resolve(filename);

        // Write CSV file
        try (FileWriter writer = new FileWriter(filePath.toFile())) {
            // Write header
            writer.append("id,user_email,action,entity_type,entity_id,status,action_date,details,ip_address,user_agent,error_message,created_at,updated_at\n");

            // Write data rows
            for (AuditLog log : logs) {
                writer.append(escapeCsv(log.getId()))
                        .append(",")
                        .append(escapeCsv(log.getUserEmail()))
                        .append(",")
                        .append(escapeCsv(log.getAction()))
                        .append(",")
                        .append(escapeCsv(log.getEntityType()))
                        .append(",")
                        .append(escapeCsv(log.getEntityId()))
                        .append(",")
                        .append(escapeCsv(log.getStatus() != null ? log.getStatus().name() : ""))
                        .append(",")
                        .append(escapeCsv(log.getActionDate() != null ? log.getActionDate().toString() : ""))
                        .append(",")
                        .append(escapeCsv(log.getDetails()))
                        .append(",")
                        .append(escapeCsv(log.getIpAddress()))
                        .append(",")
                        .append(escapeCsv(log.getUserAgent()))
                        .append(",")
                        .append(escapeCsv(log.getErrorMessage()))
                        .append(",")
                        .append(escapeCsv(log.getCreatedAt() != null ? log.getCreatedAt().toString() : ""))
                        .append(",")
                        .append(escapeCsv(log.getUpdatedAt() != null ? log.getUpdatedAt().toString() : ""))
                        .append("\n");
            }
        }

        return filePath.toString();
    }

    /**
     * Escape CSV values to handle commas, quotes, and newlines
     */
    private String escapeCsv(Object value) {
        if (value == null) {
            return "";
        }
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            str = "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    /**
     * Get retention configuration
     */
    public RetentionConfig getConfig() {
        return new RetentionConfig(retentionDays, archiveEnabled, archivePath);
    }

    /**
     * Result of archive operation
     */
    public record ArchiveResult(int archivedCount, int deletedCount, String archiveFile) {}

    /**
     * Retention configuration
     */
    public record RetentionConfig(int retentionDays, boolean archiveEnabled, String archivePath) {}
}
