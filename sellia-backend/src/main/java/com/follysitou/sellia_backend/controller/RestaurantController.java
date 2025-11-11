package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.RestaurantUpdateRequest;
import com.follysitou.sellia_backend.dto.response.RestaurantResponse;
import com.follysitou.sellia_backend.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @Value("${app.restaurant-logos-dir:./uploads/restaurant}")
    private String restaurantLogosDir;

    @GetMapping
    public ResponseEntity<RestaurantResponse> getRestaurant() {
        RestaurantResponse response = restaurantService.getRestaurant();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @ModelAttribute RestaurantUpdateRequest request) {
        RestaurantResponse response = restaurantService.createRestaurant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @Valid @ModelAttribute RestaurantUpdateRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurant(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logo/{filename}")
    public ResponseEntity<Resource> getRestaurantLogo(@PathVariable String filename) throws IOException {
        try {
            java.nio.file.Path filePath = Paths.get(restaurantLogosDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Detect content type
            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                // Fallback to extension-based detection
                contentType = getContentTypeFromFilename(filename);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getContentTypeFromFilename(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerFilename.endsWith(".svg")) {
            return "image/svg+xml";
        } else {
            return "application/octet-stream";
        }
    }
}
