package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.GlobalSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.GlobalSessionOpenRequest;
import com.follysitou.sellia_backend.dto.response.GlobalSessionResponse;
import com.follysitou.sellia_backend.dto.response.GlobalSessionSummaryResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.service.GlobalSessionService;
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
@RequestMapping("/api/global-sessions")
@RequiredArgsConstructor
public class GlobalSessionController {

    private final GlobalSessionService globalSessionService;

    @PostMapping("/open")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalSessionResponse> openSession(@Valid @RequestBody GlobalSessionOpenRequest request) {
        GlobalSessionResponse response = globalSessionService.openSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{publicId}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalSessionResponse> closeSession(
            @PathVariable String publicId,
            @Valid @RequestBody GlobalSessionCloseRequest request) {
        GlobalSessionResponse response = globalSessionService.closeSession(publicId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GlobalSessionResponse> getCurrentSession() {
        GlobalSessionResponse response = globalSessionService.getCurrentSession();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GlobalSessionResponse> getSessionById(@PathVariable String publicId) {
        GlobalSessionResponse response = globalSessionService.getSessionById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalSessionSummaryResponse> getGlobalSessionSummary(@PathVariable String publicId) {
        GlobalSessionSummaryResponse summary = globalSessionService.getGlobalSessionSummary(publicId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<GlobalSessionResponse>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GlobalSessionResponse> sessions = globalSessionService.getAllSessions(pageable);
        PagedResponse<GlobalSessionResponse> response = PagedResponse.of(sessions);
        return ResponseEntity.ok(response);
    }
}
