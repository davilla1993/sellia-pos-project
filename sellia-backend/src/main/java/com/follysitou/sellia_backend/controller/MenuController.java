package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.MenuCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.enums.MenuType;
import com.follysitou.sellia_backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @Value("${app.products-images-dir:./uploads/products}")
    private String productsImagesDir;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> createMenu(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam String menuType,
            @RequestParam String bundlePrice,
            @RequestParam(required = false, defaultValue = "true") String active,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image) {
        
        MenuCreateRequest request = new MenuCreateRequest();
        request.setName(name);
        request.setDescription(description);
        try {
            request.setMenuType(MenuType.valueOf(menuType));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid menu type: " + menuType);
        }
        request.setBundlePrice(Long.parseLong(bundlePrice));
        request.setActive(Boolean.parseBoolean(active));
        
        if (startDate != null && !startDate.isEmpty()) {
            request.setStartDate(java.time.LocalDateTime.parse(startDate));
        }
        if (endDate != null && !endDate.isEmpty()) {
            request.setEndDate(java.time.LocalDateTime.parse(endDate));
        }
        request.setImage(image);
        
        MenuResponse response = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getMenuImage(@PathVariable String filename) throws IOException {
        try {
            java.nio.file.Path filePath = Paths.get(productsImagesDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Menu image not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            log.info("Serving menu image: {}", filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error serving menu image: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
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

    @PutMapping(value = "/{publicId}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuResponse> updateMenu(
            @PathVariable String publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String menuType,
            @RequestParam(required = false) String bundlePrice,
            @RequestParam(required = false) String active,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image) {
        
        MenuUpdateRequest request = new MenuUpdateRequest();
        if (name != null && !name.isEmpty()) {
            request.setName(name);
        }
        if (description != null && !description.isEmpty()) {
            request.setDescription(description);
        }
        if (menuType != null && !menuType.isEmpty()) {
            try {
                request.setMenuType(MenuType.valueOf(menuType));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        if (bundlePrice != null && !bundlePrice.isEmpty()) {
            request.setBundlePrice(Long.parseLong(bundlePrice));
        }
        if (active != null && !active.isEmpty()) {
            request.setActive(Boolean.parseBoolean(active));
        }
        if (startDate != null && !startDate.isEmpty()) {
            request.setStartDate(java.time.LocalDateTime.parse(startDate));
        }
        if (endDate != null && !endDate.isEmpty()) {
            request.setEndDate(java.time.LocalDateTime.parse(endDate));
        }
        request.setImage(image);
        
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

    @GetMapping("/types/all")
    public ResponseEntity<List<String>> getMenuTypes() {
        List<String> types = List.of(MenuType.values()).stream()
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(types);
    }
}
