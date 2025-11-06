package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.CashOperationCreateRequest;
import com.follysitou.sellia_backend.dto.request.CashOperationUpdateAdminNotesRequest;
import com.follysitou.sellia_backend.dto.response.CashOperationResponse;
import com.follysitou.sellia_backend.dto.response.CashOperationTotalsResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.service.CashOperationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cash-operations")
@RequiredArgsConstructor
public class CashOperationController {

    private final CashOperationService cashOperationService;

    @PostMapping
    @PreAuthorize("hasRole('CAISSE') or hasRole('ADMIN')")
    public ResponseEntity<CashOperationResponse> createCashOperation(@Valid @RequestBody CashOperationCreateRequest request) {
        CashOperationResponse response = cashOperationService.createCashOperation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{publicId}/admin-notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashOperationResponse> updateAdminNotes(
            @PathVariable String publicId,
            @Valid @RequestBody CashOperationUpdateAdminNotesRequest request) {
        CashOperationResponse response = cashOperationService.updateAdminNotes(publicId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('CAISSE') or hasRole('ADMIN')")
    public ResponseEntity<List<CashOperationResponse>> getOperationsBySession(@PathVariable String sessionId) {
        List<CashOperationResponse> operations = cashOperationService.getOperationsBySession(sessionId);
        return ResponseEntity.ok(operations);
    }

    @GetMapping("/session/{sessionId}/paged")
    @PreAuthorize("hasRole('CAISSE') or hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashOperationResponse>> getOperationsBySessionPaged(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashOperationResponse> operations = cashOperationService.getOperationsBySessionPaged(sessionId, pageable);
        return ResponseEntity.ok(PagedResponse.of(operations));
    }

    @GetMapping("/session/{sessionId}/totals")
    @PreAuthorize("hasRole('CAISSE') or hasRole('ADMIN')")
    public ResponseEntity<CashOperationTotalsResponse> getTotalsBySession(@PathVariable String sessionId) {
        CashOperationTotalsResponse totals = cashOperationService.getTotalsBySession(sessionId);
        return ResponseEntity.ok(totals);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashOperationResponse>> getAllOperations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashOperationResponse> operations = cashOperationService.getAllOperations(pageable);
        return ResponseEntity.ok(PagedResponse.of(operations));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashOperationResponse>> getOperationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashOperationResponse> operations = cashOperationService.getOperationsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(PagedResponse.of(operations));
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashOperationResponse>> getOperationsByCashier(
            @PathVariable String cashierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashOperationResponse> operations = cashOperationService.getOperationsByCashier(cashierId, pageable);
        return ResponseEntity.ok(PagedResponse.of(operations));
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("hasRole('CAISSE') or hasRole('ADMIN')")
    public ResponseEntity<CashOperationResponse> getOperationById(@PathVariable String publicId) {
        CashOperationResponse operation = cashOperationService.getOperationById(publicId);
        return ResponseEntity.ok(operation);
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCashOperation(@PathVariable String publicId) {
        cashOperationService.deleteCashOperation(publicId);
        return ResponseEntity.noContent().build();
    }
}
