package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.CustomerSessionCreateRequest;
import com.follysitou.sellia_backend.dto.response.CustomerSessionResponse;
import com.follysitou.sellia_backend.dto.response.InvoiceDetailResponse;
import com.follysitou.sellia_backend.dto.response.OrderResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.mapper.OrderMapper;
import com.follysitou.sellia_backend.service.CustomerSessionService;
import com.follysitou.sellia_backend.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer-sessions")
@RequiredArgsConstructor
public class CustomerSessionController {

    private final CustomerSessionService customerSessionService;
    private final OrderMapper orderMapper;
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<CustomerSessionResponse> startOrResumeSession(
            @Valid @RequestBody CustomerSessionCreateRequest request) {
        CustomerSessionResponse response = customerSessionService.getOrCreateSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{sessionPublicId}")
    public ResponseEntity<CustomerSessionResponse> getSession(@PathVariable String sessionPublicId) {
        CustomerSessionResponse response = customerSessionService.getSessionById(sessionPublicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sessionPublicId}/orders")
    public ResponseEntity<PagedResponse<OrderResponse>> getSessionOrders(
            @PathVariable String sessionPublicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        var ordersPage = customerSessionService.getSessionOrdersPaginated(sessionPublicId, pageable);
        PagedResponse<OrderResponse> response = PagedResponse.of(ordersPage.map(orderMapper::toResponse));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionPublicId}/finalize")
    public ResponseEntity<Map<String, Object>> finalizeSession(@PathVariable String sessionPublicId) {
        CustomerSessionResponse sessionResponse = customerSessionService.finalizeSession(sessionPublicId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("session", sessionResponse);
        response.put("message", "Session finalized. Invoice generated.");
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{sessionPublicId}/info")
    public ResponseEntity<CustomerSessionResponse> updateSessionInfo(
            @PathVariable String sessionPublicId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String customerPhone) {
        CustomerSessionResponse response = customerSessionService.updateSessionInfo(
                sessionPublicId,
                customerName,
                customerPhone
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/table/{tablePublicId}/active")
    public ResponseEntity<CustomerSessionResponse> getActiveSessionByTable(@PathVariable String tablePublicId) {
        CustomerSessionResponse response = customerSessionService.getActiveSessionByTable(tablePublicId);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère la facture détaillée d'une session avec les items séparés par WorkStation (CUISINE & BAR)
     */
    @GetMapping("/{sessionPublicId}/invoice")
    public ResponseEntity<InvoiceDetailResponse> getSessionInvoiceDetail(@PathVariable String sessionPublicId) {
        InvoiceDetailResponse invoice = invoiceService.getInvoiceDetailBySession(sessionPublicId);
        return ResponseEntity.ok(invoice);
    }
}
