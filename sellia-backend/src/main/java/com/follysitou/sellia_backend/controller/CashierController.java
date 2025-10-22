package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.CashierChangePinRequest;
import com.follysitou.sellia_backend.dto.request.CashierCreateRequest;
import com.follysitou.sellia_backend.dto.request.CashierUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CashierResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.security.SecurityContextUtils;
import com.follysitou.sellia_backend.service.CashierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cashiers")
@RequiredArgsConstructor
public class CashierController {

    private final CashierService cashierService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashierResponse> createCashier(@Valid @RequestBody CashierCreateRequest request) {
        CashierResponse response = cashierService.createCashier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CashierResponse> getCashierById(@PathVariable String publicId) {
        CashierResponse response = cashierService.getCashierById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<CashierResponse>> getAllCashiers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashierResponse> cashiers = cashierService.getAllCashiers(pageable);
        PagedResponse<CashierResponse> response = PagedResponse.of(cashiers);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-cashiers")
    @PreAuthorize("hasRole('CAISSIER')")
    public ResponseEntity<PagedResponse<CashierResponse>> getMyCashiers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = SecurityContextUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<CashierResponse> cashiers = cashierService.getCashiersByUser(userId, pageable);
        PagedResponse<CashierResponse> response = PagedResponse.of(cashiers);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashierResponse> updateCashier(
            @PathVariable String publicId,
            @Valid @RequestBody CashierUpdateRequest request) {
        CashierResponse response = cashierService.updateCashier(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/change-pin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashierResponse> changePin(
            @PathVariable String publicId,
            @Valid @RequestBody CashierChangePinRequest request) {
        CashierResponse response = cashierService.changePin(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockCashier(@PathVariable String publicId) {
        cashierService.unlockCashier(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateCashier(@PathVariable String publicId) {
        cashierService.deactivateCashier(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cashierId}/assign-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignUserToCashier(
            @PathVariable String cashierId,
            @PathVariable String userId) {
        cashierService.assignUserToCashier(cashierId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{cashierId}/remove-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeUserFromCashier(
            @PathVariable String cashierId,
            @PathVariable String userId) {
        cashierService.removeUserFromCashier(cashierId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/assigned-cashiers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Set<CashierResponse>> getAssignedUserCashiers(@PathVariable String userId) {
        java.util.Set<CashierResponse> cashiers = cashierService.getAssignedUserCashiers(userId);
        return ResponseEntity.ok(cashiers);
    }
}
