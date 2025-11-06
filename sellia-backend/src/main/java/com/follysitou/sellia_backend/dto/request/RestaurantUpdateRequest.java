package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantUpdateRequest {
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private String logoUrl;

    @Size(max = 200)
    private String address;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 100)
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
    private Long maxCashOperationAmount;
}
