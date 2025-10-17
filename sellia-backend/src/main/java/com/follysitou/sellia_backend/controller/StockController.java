package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.StockCreateRequest;
import com.follysitou.sellia_backend.dto.request.StockUpdateRequest;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.dto.response.StockResponse;
import com.follysitou.sellia_backend.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<StockResponse> createStock(@Valid @RequestBody StockCreateRequest request) {
        StockResponse response = stockService.createStock(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/{publicId}")
    public ResponseEntity<StockResponse> getStock(@PathVariable String publicId) {
        StockResponse response = stockService.getStockById(publicId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping
    public ResponseEntity<PagedResponse<StockResponse>> getAllStocks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<StockResponse> response = stockService.getAllStocks(pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/active/list")
    public ResponseEntity<PagedResponse<StockResponse>> getAllActiveStocks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<StockResponse> response = stockService.getAllActiveStocks(pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/low-stock/list")
    public ResponseEntity<List<StockResponse>> getLowStockItems() {
        List<StockResponse> response = stockService.getLowStockItems();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/below-minimum/list")
    public ResponseEntity<List<StockResponse>> getBelowMinimumQuantity() {
        List<StockResponse> response = stockService.getBelowMinimumQuantity();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping("/above-maximum/list")
    public ResponseEntity<List<StockResponse>> getAboveMaximumQuantity() {
        List<StockResponse> response = stockService.getAboveMaximumQuantity();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{publicId}")
    public ResponseEntity<StockResponse> updateStock(
            @PathVariable String publicId,
            @Valid @RequestBody StockUpdateRequest request) {
        StockResponse response = stockService.updateStock(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{publicId}/adjust")
    public ResponseEntity<StockResponse> adjustStock(
            @PathVariable String publicId,
            @RequestParam Long quantityChange,
            @RequestParam(required = false) String reason) {
        StockResponse response = stockService.adjustStock(publicId, quantityChange, reason != null ? reason : "Manual adjustment");
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteStock(@PathVariable String publicId) {
        stockService.deleteStock(publicId);
        return ResponseEntity.noContent().build();
    }
}
