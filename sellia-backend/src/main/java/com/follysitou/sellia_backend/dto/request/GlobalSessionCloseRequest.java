package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GlobalSessionCloseRequest {

    @NotNull(message = "Final amount is required")
    private Long finalAmount;

    private String reconciliationNotes;

    private Long reconciliationAmount;
}
