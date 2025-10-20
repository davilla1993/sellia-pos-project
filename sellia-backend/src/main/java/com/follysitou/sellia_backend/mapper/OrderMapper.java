package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.OrderCreateRequest;
import com.follysitou.sellia_backend.dto.request.OrderUpdateRequest;
import com.follysitou.sellia_backend.dto.response.OrderResponse;
import com.follysitou.sellia_backend.model.*;
import com.follysitou.sellia_backend.model.Cashier;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    public Order toEntity(OrderCreateRequest request) {
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .orderType(request.getOrderType() != null ? request.getOrderType() : com.follysitou.sellia_backend.enums.OrderType.TABLE)
                .discountAmount(request.getDiscountAmount())
                .notes(request.getNotes())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .totalAmount(0L) // Will be calculated
                .isPaid(false)
                .status(OrderStatus.EN_ATTENTE)
                .build();

        // Note: Table, CustomerSession, and OrderItems will be set in service layer
        return order;
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setPublicId(order.getPublicId());
        response.setOrderNumber(order.getOrderNumber());
        response.setTable(toRestaurantTableResponse(order.getTable()));
        response.setOrderType(order.getOrderType());
        response.setCustomerSession(toCustomerSessionResponse(order.getCustomerSession()));
        response.setCashierSession(toCashierSessionResponse(order.getCashierSession()));
        response.setInvoice(toInvoiceResponse(order.getInvoice()));
        
        if (order.getItems() != null) {
            response.setItems(order.getItems().stream()
                    .map(this::toOrderItemResponse)
                    .collect(Collectors.toList()));
        }
        
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setFinalAmount(calculateFinalAmount(order));
        response.setNotes(order.getNotes());
        response.setIsPaid(order.getIsPaid());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaidAt(order.getPaidAt());
        response.setAcceptedAt(order.getAcceptedAt());
        response.setCompletedAt(order.getCompletedAt());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        return response;
    }

    public void updateEntityFromRequest(OrderUpdateRequest request, Order order) {
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }
        if (request.getCustomerName() != null) {
            order.setCustomerName(request.getCustomerName());
        }
        if (request.getCustomerPhone() != null) {
            order.setCustomerPhone(request.getCustomerPhone());
        }
    }

    public OrderItem toItemEntity(OrderCreateRequest.OrderItemRequest request) {
        OrderItem item = OrderItem.builder()
                .quantity(request.getQuantity())
                .specialInstructions(request.getNotes())
                .unitPrice(0L) // Will be set when product is attached
                .totalPrice(0L) // Will be calculated
                .build();
        // Note: Product will be set in service layer
        return item;
    }

    private String generateOrderNumber() {
        // This would typically use a sequence or database function
        // For now, returning a placeholder
        return String.format("%06d", System.currentTimeMillis() % 1000000);
    }

    private Long calculateFinalAmount(Order order) {
        long finalAmount = order.getTotalAmount();
        if (order.getDiscountAmount() != null) {
            finalAmount -= order.getDiscountAmount();
        }
        return Math.max(0, finalAmount);
    }

    private OrderResponse.RestaurantTableResponse toRestaurantTableResponse(RestaurantTable table) {
        if (table == null) return null;
        
        OrderResponse.RestaurantTableResponse response = new OrderResponse.RestaurantTableResponse();
        response.setPublicId(table.getPublicId());
        response.setNumber(table.getNumber());
        response.setName(table.getName());
        response.setRoom(table.getRoom());
        response.setCapacity(table.getCapacity());
        response.setIsVip(table.getIsVip());
        response.setOccupied(table.getOccupied());
        return response;
    }

    private OrderResponse.CustomerSessionResponse toCustomerSessionResponse(CustomerSession session) {
        if (session == null) return null;
        
        OrderResponse.CustomerSessionResponse response = new OrderResponse.CustomerSessionResponse();
        response.setPublicId(session.getPublicId());
        response.setQrCode(session.getQrCodeToken());
        response.setStartedAt(session.getSessionStart());
        response.setEndedAt(session.getSessionEnd());
        return response;
    }

    private OrderResponse.InvoiceResponse toInvoiceResponse(Invoice invoice) {
        if (invoice == null) return null;
        
        OrderResponse.InvoiceResponse response = new OrderResponse.InvoiceResponse();
        response.setPublicId(invoice.getPublicId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setIsPaid(invoice.getStatus().name().equals("PAID"));
        response.setPaidAt(invoice.getPaidAt());
        return response;
    }

    private OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem item) {
        OrderResponse.OrderItemResponse response = new OrderResponse.OrderItemResponse();
        response.setPublicId(item.getPublicId());
        response.setProduct(toProductSimpleResponse(item.getProduct()));
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        response.setNotes(item.getSpecialInstructions());
        return response;
    }

    private OrderResponse.ProductSimpleResponse toProductSimpleResponse(Product product) {
        if (product == null) return null;
        
        OrderResponse.ProductSimpleResponse response = new OrderResponse.ProductSimpleResponse();
        response.setPublicId(product.getPublicId());
        response.setName(product.getName());
        response.setImageUrl(product.getImageUrl());
        response.setPreparationTime(product.getPreparationTime());
        return response;
    }

    private OrderResponse.CashierSessionResponse toCashierSessionResponse(CashierSession session) {
        if (session == null) return null;
        
        OrderResponse.CashierSessionResponse response = new OrderResponse.CashierSessionResponse();
        response.setPublicId(session.getPublicId());
        response.setCashier(toCashierResponse(session.getCashier()));
        response.setUser(toUserResponse(session.getUser()));
        response.setOpenedAt(session.getOpenedAt());
        response.setClosedAt(session.getClosedAt());
        return response;
    }

    private OrderResponse.CashierResponse toCashierResponse(Cashier cashier) {
        if (cashier == null) return null;
        
        OrderResponse.CashierResponse response = new OrderResponse.CashierResponse();
        response.setPublicId(cashier.getPublicId());
        response.setName(cashier.getName());
        response.setCashierNumber(cashier.getCashierNumber());
        return response;
    }

    private OrderResponse.UserResponse toUserResponse(User user) {
        if (user == null) return null;
        
        OrderResponse.UserResponse response = new OrderResponse.UserResponse();
        response.setPublicId(user.getPublicId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setUsername(user.getUsername());
        return response;
    }
}
