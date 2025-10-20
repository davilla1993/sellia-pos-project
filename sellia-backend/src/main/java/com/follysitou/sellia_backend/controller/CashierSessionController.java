package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.CashierSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionOpenRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionPinUnlockRequest;
import com.follysitou.sellia_backend.dto.response.CashierSessionResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.service.CashierSessionService;
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
@RequestMapping("/api/cashier-sessions")
@RequiredArgsConstructor
public class CashierSessionController {

    private final CashierSessionService cashierSessionService;

    @PostMapping("/open")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<CashierSessionResponse> openSession(@Valid @RequestBody CashierSessionOpenRequest request) {
        CashierSessionResponse response = cashierSessionService.openSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{publicId}/lock")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<CashierSessionResponse> lockSession(@PathVariable String publicId) {
        CashierSessionResponse response = cashierSessionService.lockSession(publicId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/unlock")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<CashierSessionResponse> unlockSession(
            @PathVariable String publicId,
            @Valid @RequestBody CashierSessionPinUnlockRequest request) {
        CashierSessionResponse response = cashierSessionService.unlockSession(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/close")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<CashierSessionResponse> closeSession(
            @PathVariable String publicId,
            @Valid @RequestBody CashierSessionCloseRequest request) {
        CashierSessionResponse response = cashierSessionService.closeSession(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/force-close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> forceCloseSession(@PathVariable String publicId) {
        cashierSessionService.forceCloseSessionByAdmin(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<CashierSessionResponse> getCurrentSession() {
        CashierSessionResponse response = cashierSessionService.getCurrentSession();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CashierSessionResponse> getSessionById(@PathVariable String publicId) {
        CashierSessionResponse response = cashierSessionService.getSessionById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashierSessionResponse>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashierSessionResponse> sessions = cashierSessionService.getAllSessions(pageable);
        PagedResponse<CashierSessionResponse> response = PagedResponse.of(sessions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/global-session/{globalSessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashierSessionResponse>> getSessionsByGlobalSession(
            @PathVariable String globalSessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashierSessionResponse> sessions = cashierSessionService.getSessionsByGlobalSession(globalSessionId, pageable);
        PagedResponse<CashierSessionResponse> response = PagedResponse.of(sessions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<CashierSessionResponse>> getSessionsByCashier(
            @PathVariable String cashierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashierSessionResponse> sessions = cashierSessionService.getSessionsByCashier(cashierId, pageable);
        PagedResponse<CashierSessionResponse> response = PagedResponse.of(sessions);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/activity")
    @PreAuthorize("hasRole('CAISSIER') or hasRole('ADMIN')")
    public ResponseEntity<Void> updateLastActivity(@PathVariable String publicId) {
        cashierSessionService.updateLastActivity(publicId);
        return ResponseEntity.noContent().build();
    }
}
