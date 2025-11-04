package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.OrderCreateRequest;
import com.follysitou.sellia_backend.dto.request.OrderUpdateRequest;
import com.follysitou.sellia_backend.dto.response.OrderResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.enums.OrderStatus;
import com.follysitou.sellia_backend.enums.OrderItemStatus;
import com.follysitou.sellia_backend.exception.BusinessException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.model.Invoice;
import com.follysitou.sellia_backend.mapper.OrderMapper;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.model.OrderItem;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.CashierSessionRepository;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.MenuRepository;
import com.follysitou.sellia_backend.repository.OrderItemRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import com.follysitou.sellia_backend.repository.ProductRepository;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import com.follysitou.sellia_backend.repository.StockRepository;
import com.follysitou.sellia_backend.repository.MenuItemRepository;
import com.follysitou.sellia_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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
    private final MenuItemRepository menuItemRepository;
    private final MenuRepository menuRepository;
    private final CustomerSessionRepository customerSessionRepository;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;
    private final CustomerSessionService customerSessionService;
    private final InventoryMovementService inventoryMovementService;
    private final StockRepository stockRepository;
    private final CashierSessionRepository cashierSessionRepository;
    private final InvoiceService invoiceService;

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
        // NOTE: cashierSession is NOT assigned here - it will be assigned at payment time
        Order order = orderMapper.toEntity(request);
        order.setOrderNumber(orderNumber);
        order.setTable(table);
        order.setCustomerSession(customerSession);
        order.setCashierSession(null); // Will be assigned at payment
        order.setOrderType(request.getOrderType() != null ? request.getOrderType() : com.follysitou.sellia_backend.enums.OrderType.TABLE);

        // Set cashier ID from current user (for tracking who created the order)
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId != null) {
            order.setCashierId(currentUserId);
        }

        // Create order items (via MenuItems, not Products directly)
        List<OrderItem> items = new ArrayList<>();
        long totalAmount = 0;

        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            // Get MenuItem or Menu
            com.follysitou.sellia_backend.model.MenuItem menuItem = null;
            Product product = null;
            long unitPrice = 0;
            if (itemRequest.getMenuPublicId() != null && !itemRequest.getMenuPublicId().isBlank()) {
                // Load complete Menu with MenuItems and Products (new POS flow) - 2 step approach
                com.follysitou.sellia_backend.model.Menu menu = menuRepository.findByPublicIdWithMenuItems(itemRequest.getMenuPublicId())
                        .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + itemRequest.getMenuPublicId()));

                // Fetch all products for all menuItems in a second query
                menu = menuRepository.fetchMenuItemProducts(menu);

                unitPrice = menu.getBundlePrice() != null ? menu.getBundlePrice() : 0L;

                // Find first MenuItem with products
                if (menu.getMenuItems() != null && !menu.getMenuItems().isEmpty()) {
                    for (com.follysitou.sellia_backend.model.MenuItem mi : menu.getMenuItems()) {
                        if (mi.getProducts() != null && !mi.getProducts().isEmpty()) {
                            menuItem = mi;
                            product = mi.getProducts().stream().findFirst().orElse(null);
                            break;
                        }
                    }
                }

                // If no menuItem found with products, check if menu has any menuItems
                if (menuItem == null && (menu.getMenuItems() == null || menu.getMenuItems().isEmpty())) {
                    throw new BusinessException("Le menu '" + menu.getName() + "' ne contient aucun article. Veuillez ajouter des articles au menu avant de créer une commande.");
                }

                // If menuItem still not found, it means menuItems exist but have no products
                if (menuItem == null) {
                    throw new BusinessException("Le menu '" + menu.getName() + "' contient des articles mais aucun produit n'y est associé. Veuillez configurer les produits dans les articles du menu.");
                }
            } else {
                // Load MenuItem with products (legacy flow)
                menuItem = menuItemRepository.findByPublicIdWithProducts(itemRequest.getMenuItemPublicId())
                        .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found: " + itemRequest.getMenuItemPublicId()));
                // Calculate unit price from MenuItem
                unitPrice = menuItem.getPriceOverride() != null ? menuItem.getPriceOverride() : 
                           menuItem.getBundlePrice() != null ? menuItem.getBundlePrice() :
                           menuItem.getProducts().isEmpty() ? 0L : 
                           menuItem.getProducts().stream().mapToLong(Product::getPrice).sum();
            }

            long itemTotal = unitPrice * itemRequest.getQuantity();

            // Get specific Product if provided, or if not already loaded from Menu
            if (product == null) {
                if (itemRequest.getProductPublicId() != null && !itemRequest.getProductPublicId().isBlank()) {
                    product = productRepository.findByPublicId(itemRequest.getProductPublicId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductPublicId()));
                } else if (menuItem != null && !menuItem.getProducts().isEmpty()) {
                    product = menuItem.getProducts().stream().findFirst().orElse(null);
                }
            }
            
            // Product is required by database constraint
            if (product == null) {
                throw new BusinessException("Le menu que vous avez choisi ne contient aucun produit. Veuillez ajouter des produits au menu avant de créer une commande.");
            }

            OrderItem orderItem = orderMapper.toItemEntity(itemRequest);
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setProduct(product);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotal);
            orderItem.setWorkStation(product.getWorkStation());

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
        if (table != null) {
            log.info("Order created: {} for table {}", orderNumber, table.getNumber());
        } else {
            log.info("Order created: {} for takeaway", orderNumber);
        }

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

        // CRITICAL: Get current cashier session and assign to order at payment time
        String currentUserId = SecurityUtil.getCurrentUserId();
        com.follysitou.sellia_backend.model.CashierSession cashierSession = null;

        if (currentUserId != null) {
            var optionalSession = cashierSessionRepository.findCurrentSessionByUser(currentUserId);
            if (optionalSession.isPresent()) {
                cashierSession = optionalSession.get();

                // Assign cashier session to order
                order.setCashierSession(cashierSession);

                // Calculate amount to add (total - discount)
                long orderAmount = order.getTotalAmount();
                if (order.getDiscountAmount() != null) {
                    orderAmount -= order.getDiscountAmount();
                }
                orderAmount = Math.max(0, orderAmount);

                // Update cashier session total sales
                cashierSession.setTotalSales((cashierSession.getTotalSales() != null ? cashierSession.getTotalSales() : 0L) + orderAmount);
                cashierSessionRepository.save(cashierSession);

                log.info("Order {} assigned to cashier session {} - Amount added: {} FCFA",
                        publicId, cashierSession.getPublicId(), orderAmount);
            } else {
                log.warn("No active cashier session found for user {} - Payment will proceed without session assignment", currentUserId);
            }
        }

        order.setIsPaid(true);
        order.setPaymentMethod(paymentMethod);
        order.setPaidAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PAYEE);

        // Save order first to get the updated state
        Order updated = orderRepository.save(order);

        // Create invoice for this order
        invoiceService.createOrderInvoice(updated, paymentMethod);

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

    public List<OrderResponse> getAllActiveOrders() {
        List<Order> orders = orderRepository.findAllActiveOrders();
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteOrder(String publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Soft delete avec audit
        order.setDeleted(true);
        order.setDeletedAt(java.time.LocalDateTime.now());
        order.setDeletedBy(SecurityUtil.getCurrentUsername());
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

    /**
     * Ajouter des items à une commande EN_ATTENTE
     * Utilisé quand le caissier ajoute des produits à une commande
     * qui n'a pas encore été acceptée
     */
    public OrderResponse addItemsToOrder(String orderId, List<OrderCreateRequest.OrderItemRequest> newItems) {
        Order order = orderRepository.findByPublicId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Règle métier: Le caissier peut ajouter des items tant que le client n'a pas payé
        // Peu importe le statut de la commande (EN_ATTENTE, EN_PREPARATION, PRETE, LIVREE)
        if (order.getIsPaid()) {
            throw new BusinessException("Impossible d'ajouter des produits à une commande déjà payée");
        }

        if (order.getStatus() == OrderStatus.ANNULEE) {
            throw new BusinessException("Impossible d'ajouter des produits à une commande annulée");
        }

        // Ajouter les nouveaux items
        long additionalAmount = 0;
        for (OrderCreateRequest.OrderItemRequest itemRequest : newItems) {
            MenuItem menuItem = menuItemRepository.findByPublicId(itemRequest.getMenuItemPublicId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found"));

            if (!menuItem.getAvailable()) {
                throw new BusinessException("MenuItem not available: " + itemRequest.getMenuItemPublicId());
            }

            long unitPrice = menuItem.getPriceOverride() != null ? menuItem.getPriceOverride() :
                           menuItem.getBundlePrice() != null ? menuItem.getBundlePrice() : 0L;

            long itemTotal = unitPrice * itemRequest.getQuantity();
            additionalAmount += itemTotal;

            Product product = null;
            if (!menuItem.getProducts().isEmpty()) {
                product = menuItem.getProducts().stream().findFirst().orElse(null);
            }
            
            // Product is required by database constraint
            if (product == null) {
                throw new BusinessException("Le menu item ne contient aucun produit. Veuillez ajouter des produits au menu item avant de créer une commande.");
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .specialInstructions(itemRequest.getNotes())
                    .workStation(product.getWorkStation())
                    .status(com.follysitou.sellia_backend.enums.OrderItemStatus.PENDING)
                    .isPrepared(false)
                    .build();

            order.getItems().add(orderItem);
            orderItemRepository.save(orderItem);
        }

        // Mettre à jour le total de la commande
        order.setTotalAmount(order.getTotalAmount() + additionalAmount);
        Order updated = orderRepository.save(order);

        log.info("Items added to order {}: +{} XAF, new total: {} XAF", 
                orderId, additionalAmount, updated.getTotalAmount());

        return orderMapper.toResponse(updated);
    }

    /**
     * Récupérer toutes les commandes non payées d'une CustomerSession
     * Utilisé pour afficher le récapitulatif avant le paiement
     */
    public List<OrderResponse> getSessionUnpaidOrders(String customerSessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(customerSessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        List<Order> orders = orderRepository.findByCustomerSessionId(customerSessionPublicId, Pageable.unpaged())
                .stream()
                .filter(order -> !order.getIsPaid() && !order.getStatus().equals(OrderStatus.ANNULEE))
                .toList();

        return orders.stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    /**
     * Récupérer toutes les commandes d'une CustomerSession (paginated)
     */
    public PagedResponse<OrderResponse> getSessionOrders(String customerSessionPublicId, Pageable pageable) {
        customerSessionRepository.findByPublicId(customerSessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        Page<Order> orders = orderRepository.findByCustomerSessionId(customerSessionPublicId, pageable);
        return PagedResponse.of(orders.map(orderMapper::toResponse));
    }

    /**
     * Payer toutes les commandes d'une session (checkout)
     * Crée une facture consolidée et marque toutes les orders comme payées
     */
    public OrderResponse checkoutAndPaySession(String customerSessionPublicId, String paymentMethod) {
        CustomerSession session = customerSessionRepository.findByPublicId(customerSessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        if (!session.getActive()) {
            throw new BusinessException("This session has been finalized");
        }

        // Récupérer toutes les orders non payées
        List<Order> orders = orderRepository.findByCustomerSessionId(customerSessionPublicId, Pageable.unpaged())
                .stream()
                .filter(order -> !order.getIsPaid())
                .toList();

        if (orders.isEmpty()) {
            throw new BusinessException("No unpaid orders found for this session");
        }

        // Calculer le total
        long totalAmount = orders.stream()
                .mapToLong(order -> {
                    long amount = order.getTotalAmount();
                    if (order.getDiscountAmount() != null) {
                        amount -= order.getDiscountAmount();
                    }
                    return Math.max(0, amount);
                })
                .sum();

        // CRITICAL: Get current cashier session for the cashier processing the payment
        String currentUserId = SecurityUtil.getCurrentUserId();
        com.follysitou.sellia_backend.model.CashierSession cashierSession = null;

        if (currentUserId != null) {
            var optionalSession = cashierSessionRepository.findCurrentSessionByUser(currentUserId);
            if (optionalSession.isPresent()) {
                cashierSession = optionalSession.get();

                // Update cashier session total sales
                cashierSession.setTotalSales((cashierSession.getTotalSales() != null ? cashierSession.getTotalSales() : 0L) + totalAmount);
                cashierSessionRepository.save(cashierSession);

                log.info("Session checkout {} assigned to cashier session {} - Amount added: {} FCFA",
                        customerSessionPublicId, cashierSession.getPublicId(), totalAmount);
            } else {
                log.warn("No active cashier session found for user {} - Session checkout will proceed without cashier session assignment", currentUserId);
            }
        }

        // Créer l'invoice consolidée
        Invoice invoice = invoiceService.createSessionInvoice(session, orders, totalAmount);

        // Marquer TOUTES les orders comme payées ET assigner la cashier session
        for (Order order : orders) {
            order.setIsPaid(true);
            order.setPaymentMethod(paymentMethod);
            order.setPaidAt(LocalDateTime.now());
            order.setStatus(OrderStatus.PAYEE);

            // Assign cashier session to order
            if (cashierSession != null) {
                order.setCashierSession(cashierSession);
            }

            orderRepository.save(order);

            // Notification
            notificationService.notifyOrderStatusChange(order);
        }

        // Marquer la session comme payée
        session.setIsPaid(true);
        customerSessionRepository.save(session);

        log.info("Session checkout completed: {} - Invoice: {} - Amount: {} XAF - Orders count: {}",
                customerSessionPublicId, invoice.getInvoiceNumber(), totalAmount, orders.size());

        // Retourner la première order (ou créer une réponse consolidée)
        return orderMapper.toResponse(orders.get(0));
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
