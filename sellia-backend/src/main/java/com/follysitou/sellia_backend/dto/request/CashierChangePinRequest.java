package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = "newPin") // SÉCURITÉ : Ne jamais logger le PIN
public class CashierChangePinRequest {

    @NotBlank(message = "New PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    private String newPin;
}
