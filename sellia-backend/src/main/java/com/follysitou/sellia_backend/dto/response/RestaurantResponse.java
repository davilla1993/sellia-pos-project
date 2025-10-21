package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private String publicId;
    private String name;
    private String description;
    private String logoUrl;
    private String address;
    private String phoneNumber;
    private String email;
    private String currency;
    private Double taxRate;
    private String timezone;
    private String defaultLanguage;
    private String openingHours;
    private Boolean isActive;
    private String qrCodePrefix;
    private Integer maxTables;
    private Boolean allowOnlinePayment;
    private Boolean allowCashPayment;
}
