package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.RestaurantResponse;
import com.follysitou.sellia_backend.model.Restaurant;
import org.springframework.stereotype.Component;

@Component
public class RestaurantMapper {
    
    public RestaurantResponse toResponse(Restaurant restaurant) {
        if (restaurant == null) return null;
        
        return RestaurantResponse.builder()
                .publicId(restaurant.getPublicId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .logoUrl(restaurant.getLogoUrl())
                .address(restaurant.getAddress())
                .phoneNumber(restaurant.getPhoneNumber())
                .email(restaurant.getEmail())
                .currency(restaurant.getCurrency())
                .taxRate(restaurant.getTaxRate())
                .timezone(restaurant.getTimezone())
                .defaultLanguage(restaurant.getDefaultLanguage())
                .openingHours(restaurant.getOpeningHours())
                .isActive(restaurant.getIsActive())
                .qrCodePrefix(restaurant.getQrCodePrefix())
                .maxTables(restaurant.getMaxTables())
                .allowOnlinePayment(restaurant.getAllowOnlinePayment())
                .allowCashPayment(restaurant.getAllowCashPayment())
                .build();
    }
}
