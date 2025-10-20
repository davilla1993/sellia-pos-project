package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CashierCreateRequest {

    @NotBlank(message = "Cashier name is required")
    @Size(max = 100, message = "Cashier name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Cashier number is required")
    private String cashierNumber;

    @NotBlank(message = "PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    private String pin;

    private Set<String> assignedUserIds;

    private String description;

    private String location;
}
