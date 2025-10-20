package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicOrderResponse {

    private String orderPublicId;
    private String orderNumber;
    private String tableNumber;
    private Integer itemCount;
    private Long totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private String message;

    public static PublicOrderResponse fromOrder(
            String orderPublicId,
            String orderNumber,
            String tableNumber,
            Integer itemCount,
            Long totalAmount,
            LocalDateTime createdAt) {
        
        return PublicOrderResponse.builder()
                .orderPublicId(orderPublicId)
                .orderNumber(orderNumber)
                .tableNumber(tableNumber)
                .itemCount(itemCount)
                .totalAmount(totalAmount)
                .status("EN_ATTENTE")
                .createdAt(createdAt)
                .message("Commande reçue! Merci de votre commande.")
                .build();
    }
}
