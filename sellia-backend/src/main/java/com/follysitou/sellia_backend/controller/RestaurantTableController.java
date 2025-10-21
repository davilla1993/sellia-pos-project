package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.RestaurantTableCreateRequest;
import com.follysitou.sellia_backend.dto.request.RestaurantTableUpdateRequest;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.dto.response.RestaurantTableResponse;
import com.follysitou.sellia_backend.service.RestaurantTableService;
import com.follysitou.sellia_backend.service.QrCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;
    private final QrCodeService qrCodeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestaurantTableResponse> createTable(@Valid @RequestBody RestaurantTableCreateRequest request) {
        RestaurantTableResponse response = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<RestaurantTableResponse> getTable(@PathVariable String publicId) {
        RestaurantTableResponse response = tableService.getTableById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<RestaurantTableResponse>> getAllTables(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantTableResponse> tables = tableService.getAllTables(pageable);
        PagedResponse<RestaurantTableResponse> response = PagedResponse.of(tables);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active/list")
    public ResponseEntity<List<RestaurantTableResponse>> getAllActiveTables() {
        List<RestaurantTableResponse> tables = tableService.getAllActiveTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/available/list")
    public ResponseEntity<List<RestaurantTableResponse>> getAvailableTables() {
        List<RestaurantTableResponse> tables = tableService.getAvailableTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/room/{room}")
    public ResponseEntity<List<RestaurantTableResponse>> getTablesByRoom(@PathVariable String room) {
        List<RestaurantTableResponse> tables = tableService.getTablesByRoom(room);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/vip/list")
    public ResponseEntity<List<RestaurantTableResponse>> getVipTables() {
        List<RestaurantTableResponse> tables = tableService.getVipTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/capacity/{minCapacity}")
    public ResponseEntity<List<RestaurantTableResponse>> getTablesByCapacity(@PathVariable Integer minCapacity) {
        List<RestaurantTableResponse> tables = tableService.getTablesByMinCapacity(minCapacity);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/stats/available-count")
    public ResponseEntity<Long> countAvailableTables() {
        Long count = tableService.countAvailableTables();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/occupied-count")
    public ResponseEntity<Long> countOccupiedTables() {
        Long count = tableService.countOccupiedTables();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestaurantTableResponse> updateTable(
            @PathVariable String publicId,
            @Valid @RequestBody RestaurantTableUpdateRequest request) {
        RestaurantTableResponse response = tableService.updateTable(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/occupy")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAISSE')")
    public ResponseEntity<Void> occupyTable(
            @PathVariable String publicId,
            @RequestParam String orderId) {
        tableService.occupyTable(publicId, orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/release")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAISSE')")
    public ResponseEntity<Void> releaseTable(@PathVariable String publicId) {
        tableService.releaseTable(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/qrcode/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> generateQrCode(@PathVariable String publicId) {
        String qrCodeUrl = qrCodeService.generateTableQrCode(publicId);
        Map<String, String> response = new HashMap<>();
        response.put("qrCodeUrl", qrCodeUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/qrcode/generate-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> generateBulkQrCodes(@RequestBody Map<String, List<String>> request) {
        List<String> tablePublicIds = request.get("tablePublicIds");
        if (tablePublicIds == null || tablePublicIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No table IDs provided"));
        }

        int generated = 0;
        for (String tablePublicId : tablePublicIds) {
            try {
                qrCodeService.generateTableQrCode(tablePublicId);
                generated++;
            } catch (Exception e) {
                // Continue with next table if one fails
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("generated", generated);
        response.put("total", tablePublicIds.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}/qrcode")
    public ResponseEntity<Map<String, String>> getQrCode(@PathVariable String publicId) {
        String qrCodeUrl = qrCodeService.generateTableQrCode(publicId);
        Map<String, String> response = new HashMap<>();
        response.put("qrCodeUrl", qrCodeUrl);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTable(@PathVariable String publicId) {
        tableService.deleteTable(publicId);
        return ResponseEntity.noContent().build();
    }
}
