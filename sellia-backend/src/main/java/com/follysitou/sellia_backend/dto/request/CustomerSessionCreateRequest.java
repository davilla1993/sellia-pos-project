package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import com.follysitou.sellia_backend.enums.OrderType;

@Data
public class CustomerSessionCreateRequest {

    private String tablePublicId; // Optionnel (null pour TAKEAWAY)

    private OrderType orderType = OrderType.TABLE; // TABLE par défaut

    private String customerName; // Obligatoire pour TAKEAWAY

    private String customerPhone;
}
