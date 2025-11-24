package com.follysitou.sellia_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Model representing a log entry captured from the application
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogEntry {

    private LocalDateTime timestamp;

    private String level;

    private String logger;

    private String message;

    private String threadName;

    private String exception;

    public LogEntry(LocalDateTime timestamp, String level, String logger, String message, String threadName) {
        this.timestamp = timestamp;
        this.level = level;
        this.logger = logger;
        this.message = message;
        this.threadName = threadName;
    }
}
