package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "restaurants")
@EqualsAndHashCode(callSuper = true)
public class Restaurant extends BaseEntity {

    @NotBlank(message = "Restaurant name is required")
    @Size(max = 100, message = "Restaurant name must not exceed 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "address")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @Column(name = "phone_number")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Column(name = "email")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotNull(message = "Currency is required")
    @Column(name = "currency", nullable = false)
    private String currency = "FCFA";

    @Column(name = "tax_rate")
    private Double taxRate = 0.0;

    @Column(name = "timezone")
    private String timezone = "Africa/Douala";

    @Column(name = "default_language")
    private String defaultLanguage = "fr";

    @Column(name = "opening_hours")
    private String openingHours;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "qr_code_prefix")
    private String qrCodePrefix = "SELLIA";

    @Column(name = "max_tables")
    private Integer maxTables = 100;

    @Column(name = "allow_online_payment")
    private Boolean allowOnlinePayment = false;

    @Column(name = "allow_cash_payment")
    private Boolean allowCashPayment = true;

    @Column(name = "max_cash_operation_amount")
    private Long maxCashOperationAmount = 50000L; // Default 50,000 FCFA
}
