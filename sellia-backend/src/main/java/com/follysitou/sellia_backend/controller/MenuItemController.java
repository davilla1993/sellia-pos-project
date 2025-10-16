package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.MenuItemCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuItemUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuItemResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.service.MenuItemService;
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
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemCreateRequest request) {
        MenuItemResponse response = menuItemService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<MenuItemResponse> getMenuItem(@PathVariable String publicId) {
        MenuItemResponse response = menuItemService.getMenuItemById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<PagedResponse<MenuItemResponse>> getMenuItems(
            @PathVariable String menuId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<MenuItemResponse> response = menuItemService.getMenuItemsByMenu(menuId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/menu/{menuId}/ordered")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsOrdered(@PathVariable String menuId) {
        List<MenuItemResponse> response = menuItemService.getMenuItemsByMenuOrdered(menuId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<PagedResponse<MenuItemResponse>> getAvailableMenuItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<MenuItemResponse> response = menuItemService.getAvailableMenuItems(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/menu/{menuId}/available")
    public ResponseEntity<PagedResponse<MenuItemResponse>> getAvailableMenuItemsByMenu(
            @PathVariable String menuId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<MenuItemResponse> response = menuItemService.getAvailableMenuItemsByMenu(menuId, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{publicId}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable String publicId,
            @Valid @RequestBody MenuItemUpdateRequest request) {
        MenuItemResponse response = menuItemService.updateMenuItem(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable String publicId) {
        menuItemService.deleteMenuItem(publicId);
        return ResponseEntity.noContent().build();
    }
}
