package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.RestaurantUpdateRequest;
import com.follysitou.sellia_backend.dto.response.RestaurantResponse;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.RestaurantMapper;
import com.follysitou.sellia_backend.model.Restaurant;
import com.follysitou.sellia_backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;

    public RestaurantResponse getRestaurant() {
        Restaurant restaurant = restaurantRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant configured"));
        return restaurantMapper.toResponse(restaurant);
    }

    public RestaurantResponse updateRestaurant(RestaurantUpdateRequest request) {
        Restaurant restaurant = restaurantRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant configured"));

        if (request.getName() != null) restaurant.setName(request.getName());
        if (request.getDescription() != null) restaurant.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) restaurant.setLogoUrl(request.getLogoUrl());
        if (request.getAddress() != null) restaurant.setAddress(request.getAddress());
        if (request.getPhoneNumber() != null) restaurant.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmail() != null) restaurant.setEmail(request.getEmail());
        if (request.getCurrency() != null) restaurant.setCurrency(request.getCurrency());
        if (request.getTaxRate() != null) restaurant.setTaxRate(request.getTaxRate());
        if (request.getTimezone() != null) restaurant.setTimezone(request.getTimezone());
        if (request.getDefaultLanguage() != null) restaurant.setDefaultLanguage(request.getDefaultLanguage());
        if (request.getOpeningHours() != null) restaurant.setOpeningHours(request.getOpeningHours());
        if (request.getIsActive() != null) restaurant.setIsActive(request.getIsActive());
        if (request.getQrCodePrefix() != null) restaurant.setQrCodePrefix(request.getQrCodePrefix());
        if (request.getMaxTables() != null) restaurant.setMaxTables(request.getMaxTables());
        if (request.getAllowOnlinePayment() != null) restaurant.setAllowOnlinePayment(request.getAllowOnlinePayment());
        if (request.getAllowCashPayment() != null) restaurant.setAllowCashPayment(request.getAllowCashPayment());
        if (request.getMaxCashOperationAmount() != null) restaurant.setMaxCashOperationAmount(request.getMaxCashOperationAmount());

        Restaurant updated = restaurantRepository.save(restaurant);
        log.info("Restaurant updated: {}", updated.getPublicId());
        return restaurantMapper.toResponse(updated);
    }
}
