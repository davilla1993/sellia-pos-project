package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/daily-sales")
    public ResponseEntity<Map<String, Object>> getDailySalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> report = reportService.getDailySalesReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> report = reportService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/orders-summary")
    public ResponseEntity<Map<String, Object>> getOrderSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> summary = reportService.getOrderSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/inventory-summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        Map<String, Object> summary = reportService.getInventorySummary();
        return ResponseEntity.ok(summary);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealthReport() {
        Map<String, Object> health = reportService.getSystemHealthReport();
        return ResponseEntity.ok(health);
    }
}
