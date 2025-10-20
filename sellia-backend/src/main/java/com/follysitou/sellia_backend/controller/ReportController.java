package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.response.CashierReportResponse;
import com.follysitou.sellia_backend.dto.response.GlobalSessionReportResponse;
import com.follysitou.sellia_backend.dto.response.UserReportResponse;
import com.follysitou.sellia_backend.service.ReportService;
import com.follysitou.sellia_backend.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    private final PdfReportService pdfReportService;

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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/global-session/{globalSessionId}")
    public ResponseEntity<GlobalSessionReportResponse> getGlobalSessionReport(
            @PathVariable String globalSessionId) {
        GlobalSessionReportResponse report = reportService.getGlobalSessionReport(globalSessionId);
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/cashier/{cashierId}")
    public ResponseEntity<CashierReportResponse> getCashierReport(
            @PathVariable String cashierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        CashierReportResponse report = reportService.getCashierReport(cashierId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserReportResponse> getUserReport(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UserReportResponse report = reportService.getUserReport(userId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/global-session/{globalSessionId}/pdf")
    public ResponseEntity<byte[]> getGlobalSessionReportPdf(
            @PathVariable String globalSessionId) {
        try {
            GlobalSessionReportResponse report = reportService.getGlobalSessionReport(globalSessionId);
            byte[] pdfContent = pdfReportService.generateGlobalSessionReportPdf(report);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    "rapport-session-" + globalSessionId + ".pdf");
            headers.setContentLength(pdfContent.length);

            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/cashier/{cashierId}/pdf")
    public ResponseEntity<byte[]> getCashierReportPdf(
            @PathVariable String cashierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            CashierReportResponse report = reportService.getCashierReport(cashierId, startDate, endDate);
            byte[] pdfContent = pdfReportService.generateCashierReportPdf(report);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    "rapport-caisse-" + cashierId + ".pdf");
            headers.setContentLength(pdfContent.length);

            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}/pdf")
    public ResponseEntity<byte[]> getUserReportPdf(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            UserReportResponse report = reportService.getUserReport(userId, startDate, endDate);
            byte[] pdfContent = pdfReportService.generateUserReportPdf(report);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    "rapport-utilisateur-" + userId + ".pdf");
            headers.setContentLength(pdfContent.length);

            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
