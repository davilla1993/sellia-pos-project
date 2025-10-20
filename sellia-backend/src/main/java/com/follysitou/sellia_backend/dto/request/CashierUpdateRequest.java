package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CashierUpdateRequest {

    @Size(max = 100, message = "Cashier name must not exceed 100 characters")
    private String name;

    private Set<String> assignedUserIds;

    private String description;

    private String location;
}
