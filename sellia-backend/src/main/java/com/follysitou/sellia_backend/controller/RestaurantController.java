package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.RestaurantUpdateRequest;
import com.follysitou.sellia_backend.dto.response.RestaurantResponse;
import com.follysitou.sellia_backend.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSE')")
    @GetMapping
    public ResponseEntity<RestaurantResponse> getRestaurant() {
        RestaurantResponse response = restaurantService.getRestaurant();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @Valid @RequestBody RestaurantUpdateRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurant(request);
        return ResponseEntity.ok(response);
    }
}
