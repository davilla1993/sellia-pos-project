package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.OrderCreateRequest;
import com.follysitou.sellia_backend.dto.request.OrderUpdateRequest;
import com.follysitou.sellia_backend.dto.response.OrderResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.enums.OrderStatus;
import com.follysitou.sellia_backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String publicId) {
        OrderResponse response = orderService.getOrderById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(@PathVariable String orderNumber) {
        OrderResponse response = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<OrderResponse> response = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/table/{tablePublicId}")
    public ResponseEntity<PagedResponse<OrderResponse>> getOrdersByTable(
            @PathVariable String tablePublicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<OrderResponse> response = orderService.getOrdersByTable(tablePublicId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<OrderResponse>> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<OrderResponse> response = orderService.getOrdersByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer-session/{customerSessionPublicId}")
    public ResponseEntity<PagedResponse<OrderResponse>> getOrdersByCustomerSession(
            @PathVariable String customerSessionPublicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<OrderResponse> response = orderService.getOrdersByCustomerSession(customerSessionPublicId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/range")
    public ResponseEntity<PagedResponse<OrderResponse>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<OrderResponse> response = orderService.getOrdersByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER')")
    @PutMapping("/{publicId}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable String publicId,
            @Valid @RequestBody OrderUpdateRequest request) {
        OrderResponse response = orderService.updateOrder(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER', 'CUISINIER')")
    @PutMapping("/{publicId}/status/{status}")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String publicId,
            @PathVariable OrderStatus status) {
        OrderResponse response = orderService.updateOrderStatus(publicId, status);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER')")
    @PutMapping("/{publicId}/discount")
    public ResponseEntity<OrderResponse> addDiscount(
            @PathVariable String publicId,
            @RequestParam Long discountAmount) {
        OrderResponse response = orderService.addDiscountToOrder(publicId, discountAmount);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER')")
    @PutMapping("/{publicId}/payment")
    public ResponseEntity<OrderResponse> markAsPaid(
            @PathVariable String publicId,
            @RequestParam String paymentMethod) {
        OrderResponse response = orderService.markOrderAsPaid(publicId, paymentMethod);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER')")
    @GetMapping("/pending/unpaid")
    public ResponseEntity<List<OrderResponse>> getUnpaidPendingOrders() {
        List<OrderResponse> response = orderService.getUnpaidPendingOrders();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER', 'CUISINIER')")
    @GetMapping("/kitchen/active")
    public ResponseEntity<List<OrderResponse>> getActiveKitchenOrders() {
        List<OrderResponse> response = orderService.getActiveKitchenOrders();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String publicId) {
        orderService.deleteOrder(publicId);
        return ResponseEntity.noContent().build();
    }
}
