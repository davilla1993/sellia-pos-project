package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.model.LogEntry;
import com.follysitou.sellia_backend.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST API for application logs
 * Only accessible to users with AUDITOR role
 */
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    /**
     * Get logs with optional filters
     */
    @GetMapping
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<List<LogEntry>> getLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search
    ) {
        List<LogEntry> logs = logService.getLogs(startDate, endDate, level, search);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get log statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        Map<String, Object> stats = logService.getLogStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get logs time series for charts
     */
    @GetMapping("/timeseries")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, Object>> getTimeSeries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        Map<String, Object> timeSeries = logService.getLogsTimeSeries(startDate, endDate);
        return ResponseEntity.ok(timeSeries);
    }

    /**
     * Clear all logs
     */
    @DeleteMapping
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, String>> clearLogs() {
        logService.clearLogs();
        return ResponseEntity.ok(Map.of("message", "All logs cleared successfully"));
    }
}
