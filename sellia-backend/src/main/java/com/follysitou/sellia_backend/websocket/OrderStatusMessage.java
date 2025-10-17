package com.follysitou.sellia_backend.websocket;

import com.follysitou.sellia_backend.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusMessage {

    private String orderPublicId;
    private String orderNumber;
    private String tablePublicId;
    private String tableNumber;
    private OrderStatus status;
    private String message;
    private LocalDateTime timestamp;
    private Long finalAmount;
}
