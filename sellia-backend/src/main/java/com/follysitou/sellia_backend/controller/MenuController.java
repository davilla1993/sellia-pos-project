package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.MenuCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.enums.MenuType;
import com.follysitou.sellia_backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> createMenu(@Valid @RequestBody MenuCreateRequest request) {
        MenuResponse response = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<MenuResponse> getMenu(@PathVariable String publicId) {
        MenuResponse response = menuService.getMenuById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<MenuResponse>> getAllMenus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MenuResponse> menus = menuService.getAllMenus(pageable);
        PagedResponse<MenuResponse> response = PagedResponse.of(menus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active/list")
    public ResponseEntity<PagedResponse<MenuResponse>> getAllActiveMenus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MenuResponse> menus = menuService.getAllActiveMenus(pageable);
        PagedResponse<MenuResponse> response = PagedResponse.of(menus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current/list")
    public ResponseEntity<List<MenuResponse>> getCurrentActiveMenus() {
        List<MenuResponse> menus = menuService.getCurrentActiveMenus();
        return ResponseEntity.ok(menus);
    }

    @GetMapping("/type/{menuType}")
    public ResponseEntity<PagedResponse<MenuResponse>> getMenusByType(
            @PathVariable MenuType menuType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MenuResponse> menus = menuService.getMenusByType(menuType, pageable);
        PagedResponse<MenuResponse> response = PagedResponse.of(menus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{menuType}/active")
    public ResponseEntity<List<MenuResponse>> getActiveMenusByType(@PathVariable MenuType menuType) {
        List<MenuResponse> menus = menuService.getActiveMenusByType(menuType);
        return ResponseEntity.ok(menus);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> updateMenu(
            @PathVariable String publicId,
            @Valid @RequestBody MenuUpdateRequest request) {
        MenuResponse response = menuService.updateMenu(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateMenu(@PathVariable String publicId) {
        menuService.activateMenu(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateMenu(@PathVariable String publicId) {
        menuService.deactivateMenu(publicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMenu(@PathVariable String publicId) {
        menuService.deleteMenu(publicId);
        return ResponseEntity.noContent().build();
    }
}
