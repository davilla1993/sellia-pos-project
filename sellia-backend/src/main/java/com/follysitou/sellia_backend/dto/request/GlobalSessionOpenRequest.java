package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GlobalSessionOpenRequest {

    @NotNull(message = "Initial amount is required")
    private Long initialAmount = 0L;
}
