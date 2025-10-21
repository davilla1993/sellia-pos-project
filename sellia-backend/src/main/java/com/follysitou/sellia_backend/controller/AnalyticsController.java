package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.response.AnalyticsSummaryResponse;
import com.follysitou.sellia_backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateEnd) {
        
        AnalyticsSummaryResponse response = analyticsService.getSummary(dateStart, dateEnd);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/active-sessions")
    public ResponseEntity<Long> getActiveSessions() {
        long activeSessions = analyticsService.getActiveSessions();
        return ResponseEntity.ok(activeSessions);
    }
}
