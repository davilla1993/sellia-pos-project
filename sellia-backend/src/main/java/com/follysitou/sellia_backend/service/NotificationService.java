package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.enums.OrderStatus;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.websocket.OrderStatusMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyOrderStatusChange(Order order) {
        OrderStatusMessage message = OrderStatusMessage.builder()
                .orderPublicId(order.getPublicId())
                .orderNumber(order.getOrderNumber())
                .tablePublicId(order.getTable() != null ? order.getTable().getPublicId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getNumber() : "TAKEAWAY")
                .status(order.getStatus())
                .timestamp(LocalDateTime.now())
                .finalAmount(calculateFinalAmount(order))
                .message(buildStatusMessage(order.getStatus()))
                .build();

        // Send to table-specific topic (for customer view) - only if table exists
        if (order.getTable() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/table/" + order.getTable().getPublicId(),
                    message
            );
        }

        // Send to kitchen topic for IN_PREPARATION and PRETE status
        if (order.getStatus() == OrderStatus.EN_PREPARATION || order.getStatus() == OrderStatus.PRETE) {
            messagingTemplate.convertAndSend("/topic/kitchen", message);
        }

        // Send to cashier topic for PRETE and LIVREE status
        if (order.getStatus() == OrderStatus.PRETE || order.getStatus() == OrderStatus.LIVREE) {
            messagingTemplate.convertAndSend("/topic/cashier", message);
        }

        log.info("Order status notification sent: {} -> {}", order.getOrderNumber(), order.getStatus());
    }

    public void notifyNewOrder(Order order) {
        OrderStatusMessage message = OrderStatusMessage.builder()
                .orderPublicId(order.getPublicId())
                .orderNumber(order.getOrderNumber())
                .tablePublicId(order.getTable() != null ? order.getTable().getPublicId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getNumber() : "TAKEAWAY")
                .status(order.getStatus())
                .timestamp(LocalDateTime.now())
                .finalAmount(calculateFinalAmount(order))
                .message("Nouvelle commande reçue")
                .build();

        // Send to kitchen
        messagingTemplate.convertAndSend("/topic/kitchen", message);
        // Send to cashier
        messagingTemplate.convertAndSend("/topic/cashier", message);

        log.info("New order notification sent: {}", order.getOrderNumber());
    }

    public void notifyOrderPrepared(Order order) {
        OrderStatusMessage message = OrderStatusMessage.builder()
                .orderPublicId(order.getPublicId())
                .orderNumber(order.getOrderNumber())
                .tablePublicId(order.getTable() != null ? order.getTable().getPublicId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getNumber() : "TAKEAWAY")
                .status(order.getStatus())
                .timestamp(LocalDateTime.now())
                .finalAmount(calculateFinalAmount(order))
                .message("Commande prête")
                .build();

        // Send to cashier
        messagingTemplate.convertAndSend("/topic/cashier", message);
        // Send to table for customer notification - only if table exists
        if (order.getTable() != null) {
            messagingTemplate.convertAndSend("/topic/table/" + order.getTable().getPublicId(), message);
        }

        log.info("Order prepared notification sent: {}", order.getOrderNumber());
    }

    private String buildStatusMessage(OrderStatus status) {
        return switch (status) {
            case EN_ATTENTE -> "Commande en attente";
            case ACCEPTEE -> "Commande acceptée";
            case EN_PREPARATION -> "Commande en préparation";
            case PRETE -> "Commande prête";
            case LIVREE -> "Commande livrée";
            case PAYEE -> "Commande payée";
            case ANNULEE -> "Commande annulée";
        };
    }

    private Long calculateFinalAmount(Order order) {
        long finalAmount = order.getTotalAmount();
        if (order.getDiscountAmount() != null) {
            finalAmount -= order.getDiscountAmount();
        }
        return Math.max(0, finalAmount);
    }
}
