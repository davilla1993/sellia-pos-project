package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.OrderCreateRequest;
import com.follysitou.sellia_backend.dto.request.OrderUpdateRequest;
import com.follysitou.sellia_backend.dto.response.OrderResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.enums.OrderStatus;
import com.follysitou.sellia_backend.exception.BusinessException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.OrderMapper;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.model.OrderItem;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.OrderItemRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import com.follysitou.sellia_backend.repository.ProductRepository;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import com.follysitou.sellia_backend.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final ProductRepository productRepository;
    private final CustomerSessionRepository customerSessionRepository;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;
    private final CustomerSessionService customerSessionService;
    private final InventoryMovementService inventoryMovementService;
    private final StockRepository stockRepository;

    public OrderResponse createOrder(OrderCreateRequest request) {
        // Validate based on order type
        RestaurantTable table = null;
        if (request.getOrderType() != null && request.getOrderType().name().equals("TABLE")) {
            if (request.getTablePublicId() == null || request.getTablePublicId().isBlank()) {
                throw new BusinessException("Table ID is required for TABLE orders");
            }
            table = restaurantTableRepository.findByPublicId(request.getTablePublicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        } else if (request.getOrderType() != null && request.getOrderType().name().equals("TAKEAWAY")) {
            // TAKEAWAY order - no table required
            table = null;
        } else {
            // Default to TABLE if order type not specified
            if (request.getTablePublicId() != null && !request.getTablePublicId().isBlank()) {
                table = restaurantTableRepository.findByPublicId(request.getTablePublicId())
                        .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
            }
        }

        // Get or null customer session
        CustomerSession customerSession = null;
        if (request.getCustomerSessionPublicId() != null) {
            customerSession = customerSessionRepository.findByPublicId(request.getCustomerSessionPublicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));
            
            // Validate session is active
            customerSessionService.validateSessionIsActive(request.getCustomerSessionPublicId());
        }

        // Generate unique order number
        String orderNumber = generateUniqueOrderNumber();

        // Create order
        Order order = orderMapper.toEntity(request);
        order.setOrderNumber(orderNumber);
        order.setTable(table);
        order.setCustomerSession(customerSession);
        order.setOrderType(request.getOrderType() != null ? request.getOrderType() : com.follysitou.sellia_backend.enums.OrderType.TABLE);

        // Create order items
        List<OrderItem> items = new ArrayList<>();
        long totalAmount = 0;

        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findByPublicId(itemRequest.getProductPublicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductPublicId()));

            long unitPrice = product.getPrice();
            long itemTotal = unitPrice * itemRequest.getQuantity();

            OrderItem orderItem = orderMapper.toItemEntity(itemRequest);
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotal);

            items.add(orderItem);
            totalAmount += itemTotal;
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        // If no customer name provided in request, use session's customer name
        if ((order.getCustomerName() == null || order.getCustomerName().isBlank()) && customerSession != null) {
            order.setCustomerName(customerSession.getCustomerName());
            order.setCustomerPhone(customerSession.getCustomerPhone());
        }

        // Apply discount if provided
        if (request.getDiscountAmount() != null && request.getDiscountAmount() > 0) {
            if (request.getDiscountAmount() > totalAmount) {
                throw new BusinessException("Discount cannot exceed total amount");
            }
            order.setDiscountAmount(request.getDiscountAmount());
        }

        // Save order and items
        Order savedOrder = orderRepository.save(order);
        log.info("Order created: {} for table {}", orderNumber, table.getNumber());

        // Record inventory movements for each item (reduce stock)
        for (OrderItem item : savedOrder.getItems()) {
            com.follysitou.sellia_backend.model.Stock stock = stockRepository.findByProductId(item.getProduct().getId())
                    .orElse(null);
            
            if (stock != null) {
                inventoryMovementService.recordSale(stock, (long) item.getQuantity(), savedOrder.getPublicId());
                log.info("Stock reduced for product: {} - quantity: {}", item.getProduct().getName(), item.getQuantity());
            }
        }

        // Notify kitchen and cashier
        notificationService.notifyNewOrder(savedOrder);

        return orderMapper.toResponse(savedOrder);
    }

    public OrderResponse getOrderById(String publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    public PagedResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAllOrders(pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    public PagedResponse<OrderResponse> getOrdersByTable(String tablePublicId, Pageable pageable) {
        RestaurantTable table = restaurantTableRepository.findByPublicId(tablePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        Page<Order> orders = orderRepository.findByTableId(table.getId(), pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    public PagedResponse<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByStatus(status, pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    public PagedResponse<OrderResponse> getOrdersByCustomerSession(String customerSessionPublicId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomerSessionId(customerSessionPublicId, pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    public PagedResponse<OrderResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<Order> orders = orderRepository.findByDateRange(startDate, endDate, pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    public OrderResponse updateOrder(String publicId, OrderUpdateRequest request) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Cannot update paid orders
        if (order.getIsPaid()) {
            throw new BusinessException("Cannot update a paid order");
        }

        // Can only update EN_ATTENTE orders (not accepted by cashier yet)
        if (order.getStatus() != OrderStatus.EN_ATTENTE) {
            throw new BusinessException("Can only modify orders that are in EN_ATTENTE status. This order is already " + order.getStatus());
        }

        // Update discount if provided
        if (request.getDiscountAmount() != null) {
            if (request.getDiscountAmount() > order.getTotalAmount()) {
                throw new BusinessException("Discount cannot exceed total amount");
            }
            order.setDiscountAmount(request.getDiscountAmount());
        }

        orderMapper.updateEntityFromRequest(request, order);
        Order updated = orderRepository.save(order);

        log.info("Order updated: {}", publicId);
        return orderMapper.toResponse(updated);
    }

    public OrderResponse updateOrderStatus(String publicId, OrderStatus newStatus) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus currentStatus = order.getStatus();

        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);

        // Set timestamp based on status
        if (newStatus == OrderStatus.ACCEPTEE) {
            order.setAcceptedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.LIVREE || newStatus == OrderStatus.PAYEE) {
            order.setCompletedAt(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        log.info("Order status updated: {} -> {}", publicId, newStatus);

        // Send real-time notification
        notificationService.notifyOrderStatusChange(updated);

        return orderMapper.toResponse(updated);
    }

    public OrderResponse addDiscountToOrder(String publicId, Long discountAmount) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getIsPaid()) {
            throw new BusinessException("Cannot add discount to a paid order");
        }

        if (discountAmount > order.getTotalAmount()) {
            throw new BusinessException("Discount cannot exceed total amount");
        }

        order.setDiscountAmount(discountAmount);
        Order updated = orderRepository.save(order);

        log.info("Discount added to order {}: {}", publicId, discountAmount);
        return orderMapper.toResponse(updated);
    }

    public OrderResponse markOrderAsPaid(String publicId, String paymentMethod) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getIsPaid()) {
            throw new BusinessException("Order is already paid");
        }

        order.setIsPaid(true);
        order.setPaymentMethod(paymentMethod);
        order.setPaidAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PAYEE);

        Order updated = orderRepository.save(order);
        log.info("Order marked as paid: {} using {}", publicId, paymentMethod);

        // Send notification
        notificationService.notifyOrderStatusChange(updated);

        return orderMapper.toResponse(updated);
    }

    public List<OrderResponse> getUnpaidPendingOrders() {
        List<Order> orders = orderRepository.findUnpaidPendingOrders();
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getActiveKitchenOrders() {
        List<Order> orders = orderRepository.findActiveKitchenOrders();
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteOrder(String publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Soft delete
        order.setDeleted(true);
        orderRepository.save(order);

        log.info("Order soft deleted: {}", publicId);
    }

    private String generateUniqueOrderNumber() {
        // Generate order number in format: YYYYMMDD-XXXXX
        String datePart = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        long sequencePart = System.currentTimeMillis() % 100000;

        String orderNumber = String.format("%s-%05d", datePart, sequencePart);

        // Ensure uniqueness (retry if collision)
        while (orderRepository.existsByOrderNumberAndDeletedFalse(orderNumber)) {
            sequencePart = (sequencePart + 1) % 100000;
            orderNumber = String.format("%s-%05d", datePart, sequencePart);
        }

        return orderNumber;
    }

    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        // Define valid transitions
        return switch (current) {
            case EN_ATTENTE -> next == OrderStatus.ACCEPTEE || next == OrderStatus.ANNULEE;
            case ACCEPTEE -> next == OrderStatus.EN_PREPARATION || next == OrderStatus.ANNULEE;
            case EN_PREPARATION -> next == OrderStatus.PRETE || next == OrderStatus.ANNULEE;
            case PRETE -> next == OrderStatus.LIVREE || next == OrderStatus.ANNULEE;
            case LIVREE -> next == OrderStatus.PAYEE;
            case PAYEE, ANNULEE -> false;
        };
    }
}
