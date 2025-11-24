package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = "pin") // SÉCURITÉ : Ne jamais logger le PIN
public class CashierSessionOpenRequest {

    @NotBlank(message = "Cashier ID is required")
    private String cashierId;

    @NotBlank(message = "PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    private String pin;

    private Long initialAmount = 0L;
}
