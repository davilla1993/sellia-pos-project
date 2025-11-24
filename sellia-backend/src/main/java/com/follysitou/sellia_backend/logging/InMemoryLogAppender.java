package com.follysitou.sellia_backend.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.StackTraceElementProxy;
import ch.qos.logback.core.AppenderBase;
import com.follysitou.sellia_backend.model.LogEntry;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Custom Logback appender that stores log events in memory
 * Thread-safe implementation using ConcurrentLinkedQueue
 */
public class InMemoryLogAppender extends AppenderBase<ILoggingEvent> {

    private static final int MAX_LOGS = 10000; // Keep last 10000 logs
    private static final Queue<LogEntry> logQueue = new ConcurrentLinkedQueue<>();

    @Override
    public void start() {
        super.start();
        addInfo("InMemoryLogAppender started - capturing logs to memory (max " + MAX_LOGS + " logs)");
        System.out.println("✅ InMemoryLogAppender STARTED - Dashboard logs will be available");
    }

    @Override
    public void stop() {
        addInfo("InMemoryLogAppender stopped - " + logQueue.size() + " logs in memory");
        super.stop();
    }

    @Override
    protected void append(ILoggingEvent eventObject) {
        LocalDateTime timestamp = LocalDateTime.ofInstant(
                eventObject.getInstant(),
                ZoneId.systemDefault()
        );

        String exceptionMessage = null;
        if (eventObject.getThrowableProxy() != null) {
            exceptionMessage = formatException(eventObject.getThrowableProxy());
        }

        LogEntry logEntry = new LogEntry(
                timestamp,
                eventObject.getLevel().toString(),
                eventObject.getLoggerName(),
                eventObject.getFormattedMessage(),
                eventObject.getThreadName(),
                exceptionMessage
        );

        logQueue.offer(logEntry);

        // Remove oldest logs if queue exceeds max size
        while (logQueue.size() > MAX_LOGS) {
            logQueue.poll();
        }
    }

    /**
     * Format exception stacktrace
     */
    private String formatException(IThrowableProxy throwableProxy) {
        StringBuilder sb = new StringBuilder();
        sb.append(throwableProxy.getClassName()).append(": ").append(throwableProxy.getMessage()).append("\n");

        for (StackTraceElementProxy step : throwableProxy.getStackTraceElementProxyArray()) {
            sb.append("\tat ").append(step.toString()).append("\n");
        }

        if (throwableProxy.getCause() != null) {
            sb.append("Caused by: ").append(formatException(throwableProxy.getCause()));
        }

        return sb.toString();
    }

    /**
     * Get all logs from the queue
     */
    public static List<LogEntry> getLogs() {
        return new ArrayList<>(logQueue);
    }

    /**
     * Clear all logs from the queue
     */
    public static void clearLogs() {
        logQueue.clear();
    }
}
