package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerSessionCreateRequest {

    @NotBlank(message = "Table ID is required")
    private String tablePublicId;

    private String customerName;

    private String customerPhone;
}
