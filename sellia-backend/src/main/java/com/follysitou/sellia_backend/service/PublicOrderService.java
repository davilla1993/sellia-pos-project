package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.PublicOrderRequest;
import com.follysitou.sellia_backend.dto.response.PublicOrderResponse;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.exception.ValidationException;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.model.OrderItem;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.MenuItemRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicOrderService {

    private final CustomerSessionRepository customerSessionRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public PublicOrderResponse createOrderFromQrCode(PublicOrderRequest request) {
        // Valider le token de session
        CustomerSession customerSession = customerSessionRepository.findByQrCodeToken(request.getCustomerSessionToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid customer session token"));

        if (!customerSession.getActive()) {
            throw new ValidationException("Session is no longer active");
        }

        // Valider que la table est VIP ou standard correctement
        if (customerSession.getTable() == null) {
            throw new ValidationException("Table not found for this session");
        }

        // Créer la commande
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerSession(customerSession)
                .totalAmount(0L)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : 0L)
                .notes(request.getNotes())
                .build();

        // Ajouter les items
        List<OrderItem> orderItems = new ArrayList<>();
        long totalAmount = 0L;

        for (PublicOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findByPublicId(itemRequest.getMenuItemPublicId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "MenuItem not found: " + itemRequest.getMenuItemPublicId()));

            if (!menuItem.getAvailable()) {
                throw new ValidationException("MenuItem is not available: " + itemRequest.getMenuItemPublicId());
            }

            // Valider VIP restriction
            validateMenuItemAccessibility(menuItem, customerSession.getTable().getIsVip());

            long itemPrice = menuItem.getPriceOverride() != null 
                    ? menuItem.getPriceOverride() 
                    : (menuItem.getBundlePrice() != null ? menuItem.getBundlePrice() : 0L);

            long itemTotal = itemPrice * itemRequest.getQuantity();
            totalAmount += itemTotal;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemPrice)
                    .totalPrice(itemTotal)
                    .specialInstructions(itemRequest.getNotes())
                    .build();

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);

        // Appliquer la réduction si valide
        if (request.getDiscountAmount() != null && request.getDiscountAmount() > 0) {
            if (request.getDiscountAmount() > totalAmount) {
                throw new ValidationException("Discount cannot exceed total amount");
            }
            totalAmount -= request.getDiscountAmount();
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        return PublicOrderResponse.fromOrder(
                savedOrder.getPublicId(),
                savedOrder.getOrderNumber(),
                customerSession.getTable().getNumber(),
                orderItems.size(),
                savedOrder.getTotalAmount(),
                savedOrder.getCreatedAt()
        );
    }

    private void validateMenuItemAccessibility(MenuItem menuItem, Boolean isTableVip) {
        // Si la table est standard, elle ne peut pas accéder aux menus VIP
        if (Boolean.FALSE.equals(isTableVip)) {
            if (menuItem.getMenu().getMenuType().name().equals("VIP")) {
                throw new ValidationException("This menu item is only available for VIP tables");
            }
        }
    }

    private String generateOrderNumber() {
        // Format: YYYYMMDD-HHMM-XXXX (date-time-random)
        return LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"))
                + "-" + String.format("%04d", (int)(Math.random() * 10000));
    }
}
