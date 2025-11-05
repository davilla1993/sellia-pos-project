package com.follysitou.sellia_backend.dto.request;

import com.follysitou.sellia_backend.enums.CashOperationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CashOperationCreateRequest {

    @NotBlank(message = "Cashier session ID is required")
    private String cashierSessionId;

    @NotNull(message = "Operation type is required")
    private CashOperationType type;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Long amount;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 100, message = "Reference cannot exceed 100 characters")
    private String reference;

    @NotBlank(message = "Authorized by is required")
    @Size(max = 200, message = "Authorized by cannot exceed 200 characters")
    private String authorizedBy;
}
