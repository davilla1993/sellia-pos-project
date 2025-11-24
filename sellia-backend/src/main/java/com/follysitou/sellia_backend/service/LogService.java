package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.logging.InMemoryLogAppender;
import com.follysitou.sellia_backend.model.LogEntry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing application logs
 */
@Service
@Slf4j
public class LogService {

    /**
     * Get logs filtered by date range, level, and search text
     */
    public List<LogEntry> getLogs(LocalDateTime startDate, LocalDateTime endDate, String level, String searchText) {
        List<LogEntry> logs = InMemoryLogAppender.getLogs();

        return logs.stream()
                .filter(log -> startDate == null || log.getTimestamp().isAfter(startDate) || log.getTimestamp().isEqual(startDate))
                .filter(log -> endDate == null || log.getTimestamp().isBefore(endDate) || log.getTimestamp().isEqual(endDate))
                .filter(log -> level == null || level.isEmpty() || log.getLevel().equalsIgnoreCase(level))
                .filter(log -> searchText == null || searchText.isEmpty() ||
                        log.getMessage().toLowerCase().contains(searchText.toLowerCase()) ||
                        log.getLogger().toLowerCase().contains(searchText.toLowerCase()))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())) // Most recent first
                .collect(Collectors.toList());
    }

    /**
     * Get log statistics
     */
    public Map<String, Object> getLogStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<LogEntry> logs = getLogs(startDate, endDate, null, null);

        long totalLogs = logs.size();
        long infoCount = logs.stream().filter(log -> "INFO".equals(log.getLevel())).count();
        long warnCount = logs.stream().filter(log -> "WARN".equals(log.getLevel())).count();
        long errorCount = logs.stream().filter(log -> "ERROR".equals(log.getLevel())).count();
        long debugCount = logs.stream().filter(log -> "DEBUG".equals(log.getLevel())).count();

        // Calculate percentages
        double infoPercent = totalLogs > 0 ? (infoCount * 100.0 / totalLogs) : 0;
        double warnPercent = totalLogs > 0 ? (warnCount * 100.0 / totalLogs) : 0;
        double errorPercent = totalLogs > 0 ? (errorCount * 100.0 / totalLogs) : 0;
        double debugPercent = totalLogs > 0 ? (debugCount * 100.0 / totalLogs) : 0;

        return Map.of(
                "totalLogs", totalLogs,
                "infoCount", infoCount,
                "warnCount", warnCount,
                "errorCount", errorCount,
                "debugCount", debugCount,
                "infoPercent", Math.round(infoPercent * 10) / 10.0,
                "warnPercent", Math.round(warnPercent * 10) / 10.0,
                "errorPercent", Math.round(errorPercent * 10) / 10.0,
                "debugPercent", Math.round(debugPercent * 10) / 10.0
        );
    }

    /**
     * Get logs grouped by hour for time series chart
     */
    public Map<String, Object> getLogsTimeSeries(LocalDateTime startDate, LocalDateTime endDate) {
        List<LogEntry> logs = getLogs(startDate, endDate, null, null);

        // Group logs by hour and level
        Map<String, Map<String, Long>> groupedByHour = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getTimestamp().withMinute(0).withSecond(0).withNano(0).toString(),
                        Collectors.groupingBy(
                                LogEntry::getLevel,
                                Collectors.counting()
                        )
                ));

        return Map.of(
                "timeSeries", groupedByHour
        );
    }

    /**
     * Clear all logs
     */
    public void clearLogs() {
        InMemoryLogAppender.clearLogs();
        log.info("All logs cleared");
    }
}
