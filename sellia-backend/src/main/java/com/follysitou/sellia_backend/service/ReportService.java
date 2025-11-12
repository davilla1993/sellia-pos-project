package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.response.CashierReportResponse;
import com.follysitou.sellia_backend.dto.response.GlobalSessionReportResponse;
import com.follysitou.sellia_backend.dto.response.ProductReportResponse;
import com.follysitou.sellia_backend.dto.response.TableReportResponse;
import com.follysitou.sellia_backend.dto.response.UserReportResponse;
import com.follysitou.sellia_backend.enums.OrderType;
import com.follysitou.sellia_backend.model.*;
import com.follysitou.sellia_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final GlobalSessionRepository globalSessionRepository;
    private final CashierSessionRepository cashierSessionRepository;
    private final CashierRepository cashierRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepo;

    public Map<String, Object> getDailySalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        Long totalRevenue = invoiceRepository.getTotalRevenueByDate(startDate, endDate);
        long totalOrders = orderRepository.countOrdersSinceDate(startDate);
        
        Map<String, Object> report = new HashMap<>();
        report.put("period", "from " + startDate + " to " + endDate);
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : 0L);
        report.put("totalOrders", totalOrders);
        report.put("averageOrderValue", totalOrders > 0 ? (totalRevenue != null ? totalRevenue / totalOrders : 0) : 0);
        report.put("generatedAt", LocalDateTime.now());
        
        log.info("Daily sales report generated: {} orders, {} revenue", totalOrders, totalRevenue);
        return report;
    }

    public Map<String, Object> getRevenueReport(LocalDateTime startDate, LocalDateTime endDate) {
        Long totalRevenue = invoiceRepository.getTotalRevenueByDate(startDate, endDate);
        long pendingInvoices = invoiceRepository.countPendingInvoices();
        
        Map<String, Object> report = new HashMap<>();
        report.put("period", "from " + startDate + " to " + endDate);
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : 0L);
        report.put("pendingInvoices", pendingInvoices);
        report.put("generatedAt", LocalDateTime.now());
        
        log.info("Revenue report generated: {} total revenue, {} pending invoices", totalRevenue, pendingInvoices);
        return report;
    }

    public Map<String, Object> getOrderSummary(LocalDateTime startDate, LocalDateTime endDate) {
        long totalOrders = orderRepository.countOrdersSinceDate(startDate);
        Long totalRevenue = invoiceRepository.getTotalRevenueByDate(startDate, endDate);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("startDate", startDate);
        summary.put("endDate", endDate);
        summary.put("totalOrders", totalOrders);
        summary.put("totalRevenue", totalRevenue != null ? totalRevenue : 0L);
        summary.put("averageOrderValue", totalOrders > 0 ? (totalRevenue != null ? totalRevenue / totalOrders : 0) : 0);
        summary.put("generatedAt", LocalDateTime.now());
        
        return summary;
    }

    public Map<String, Object> getInventorySummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("message", "Inventory report - integrate with StockService for detailed data");
        summary.put("generatedAt", LocalDateTime.now());
        return summary;
    }

    public Map<String, Object> getSystemHealthReport() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "OK");
        health.put("totalOrders", orderRepository.count());
        health.put("totalInvoices", invoiceRepository.count());
        health.put("pendingPayments", invoiceRepository.countPendingInvoices());
        health.put("generatedAt", LocalDateTime.now());
        
        log.info("System health report generated");
        return health;
    }

    public GlobalSessionReportResponse getGlobalSessionReport(String globalSessionId) {
        GlobalSession session = globalSessionRepository.findByPublicId(globalSessionId)
                .orElseThrow(() -> new RuntimeException("Global session not found"));

        List<CashierSession> cashierSessions = cashierSessionRepository
                .findAllSessionsByGlobalSession(session);

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCashierSession() != null && 
                       cashierSessions.contains(o.getCashierSession()))
                .collect(Collectors.toList());

        Long totalSales = orders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        Long totalDiscounts = orders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        List<GlobalSessionReportResponse.CashierSessionSummary> sessionSummaries = cashierSessions.stream()
                .map(cs -> GlobalSessionReportResponse.CashierSessionSummary.builder()
                        .publicId(cs.getPublicId())
                        .cashierName(cs.getCashier().getName())
                        .cashierNumber(cs.getCashier().getCashierNumber())
                        .userName(cs.getUser().getFirstName() + " " + cs.getUser().getLastName())
                        .openedAt(cs.getOpenedAt())
                        .closedAt(cs.getClosedAt())
                        .totalSales(cs.getTotalSales())
                        .orderCount((long) orders.stream()
                                .filter(o -> o.getCashierSession().equals(cs))
                                .count())
                        .build())
                .collect(Collectors.toList());

        Map<String, Integer> productQuantities = new HashMap<>();
        Map<String, Long> productSales = new HashMap<>();
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().forEach(item -> {
                    String productName = item.getProduct().getName();
                    productQuantities.put(productName,
                            productQuantities.getOrDefault(productName, 0) + item.getQuantity());
                    productSales.put(productName,
                            productSales.getOrDefault(productName, 0L) + (item.getTotalPrice() != null ? item.getTotalPrice() : 0L));
                });
            }
        });

        List<GlobalSessionReportResponse.OrderSummary> topProducts = productSales.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(e -> GlobalSessionReportResponse.OrderSummary.builder()
                        .productName(e.getKey())
                        .quantity(productQuantities.getOrDefault(e.getKey(), 0))
                        .totalAmount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        GlobalSessionReportResponse.UserResponse openedBy = toUserResponse(session.getOpenedBy());
        GlobalSessionReportResponse.UserResponse closedBy = session.getClosedBy() != null ? 
                toUserResponse(session.getClosedBy()) : null;

        return GlobalSessionReportResponse.builder()
                .publicId(session.getPublicId())
                .status(session.getStatus())
                .openedAt(session.getOpenedAt())
                .closedAt(session.getClosedAt())
                .openedBy(openedBy)
                .closedBy(closedBy)
                .initialAmount(session.getInitialAmount())
                .finalAmount(session.getFinalAmount())
                .totalSales(totalSales)
                .totalOrders((long) orders.size())
                .totalDiscounts(totalDiscounts)
                .cashierSessions(sessionSummaries)
                .topProducts(topProducts)
                .build();
    }

    public CashierReportResponse getCashierReport(String cashierId, LocalDateTime startDate, LocalDateTime endDate) {
        Cashier cashier = cashierRepository.findByPublicId(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));

        List<CashierSession> sessions = cashierSessionRepository.findByCashier(cashierId, 
                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCashierSession() != null && 
                       sessions.contains(o.getCashierSession()) &&
                       o.getCreatedAt().isAfter(startDate) &&
                       o.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        Long totalSales = orders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        Long totalDiscounts = orders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        List<CashierReportResponse.SessionSummary> sessionSummaries = sessions.stream()
                .map(s -> CashierReportResponse.SessionSummary.builder()
                        .sessionPublicId(s.getPublicId())
                        .userName(s.getUser().getFirstName() + " " + s.getUser().getLastName())
                        .openedAt(s.getOpenedAt())
                        .closedAt(s.getClosedAt())
                        .salesAmount(s.getTotalSales())
                        .orderCount((long) orders.stream().filter(o -> o.getCashierSession().equals(s)).count())
                        .build())
                .collect(Collectors.toList());

        Map<String, Integer> productCount = new HashMap<>();
        Map<String, Long> productSales = new HashMap<>();
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().forEach(item -> {
                    String productName = item.getProduct().getName();
                    productCount.put(productName, productCount.getOrDefault(productName, 0) + item.getQuantity());
                    productSales.put(productName,
                            productSales.getOrDefault(productName, 0L) + (item.getTotalPrice() != null ? item.getTotalPrice() : 0L));
                });
            }
        });

        List<CashierReportResponse.ProductSummary> topProducts = productCount.keySet().stream()
                .sorted((a, b) -> Integer.compare(productCount.get(b), productCount.get(a)))
                .limit(10)
                .map(productName -> CashierReportResponse.ProductSummary.builder()
                        .productName(productName)
                        .quantity(productCount.get(productName))
                        .totalAmount(productSales.get(productName))
                        .build())
                .collect(Collectors.toList());

        Set<User> users = sessions.stream()
                .map(CashierSession::getUser)
                .collect(Collectors.toSet());

        List<CashierReportResponse.UserSummary> userSummaries = users.stream()
                .map(user -> {
                    long userOrders = orders.stream()
                            .filter(o -> o.getCashierSession() != null && o.getCashierSession().getUser().equals(user))
                            .count();
                    long userSales = orders.stream()
                            .filter(o -> o.getCashierSession() != null && o.getCashierSession().getUser().equals(user))
                            .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                            .sum();
                    return CashierReportResponse.UserSummary.builder()
                            .userPublicId(user.getPublicId())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .totalSales(userSales)
                            .orderCount(userOrders)
                            .build();
                })
                .collect(Collectors.toList());

        return CashierReportResponse.builder()
                .cashierPublicId(cashier.getPublicId())
                .cashierName(cashier.getName())
                .cashierNumber(cashier.getCashierNumber())
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalSales(totalSales)
                .totalOrders((long) orders.size())
                .totalDiscounts(totalDiscounts)
                .averageOrderValue(orders.isEmpty() ? 0 : totalSales / orders.size())
                .sessions(sessionSummaries)
                .topProducts(topProducts)
                .users(userSummaries)
                .build();
    }

    public UserReportResponse getUserReport(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CashierSession> userSessions = cashierSessionRepository.findByUser(userId,
                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCashierSession() != null && 
                       userSessions.contains(o.getCashierSession()) &&
                       o.getCreatedAt().isAfter(startDate) &&
                       o.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        Long totalSales = orders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        Long totalDiscounts = orders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        Double averageDiscount = orders.isEmpty() ? 0.0 : 
                (double) totalDiscounts / orders.size();

        Map<String, Long> cashierSales = new HashMap<>();
        userSessions.forEach(session -> {
            String cashierName = session.getCashier().getName();
            long cashierOrderSales = orders.stream()
                    .filter(o -> o.getCashierSession().equals(session))
                    .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                    .sum();
            cashierSales.put(cashierName, cashierOrderSales);
        });

        List<UserReportResponse.CashierSummary> cashierSummaries = cashierSales.entrySet().stream()
                .map(e -> UserReportResponse.CashierSummary.builder()
                        .cashierName(e.getKey())
                        .totalSales(e.getValue())
                        .orderCount((long) orders.stream()
                                .filter(o -> o.getCashierSession().getCashier().getName().equals(e.getKey()))
                                .count())
                        .build())
                .collect(Collectors.toList());

        List<UserReportResponse.SessionSummary> sessionSummaries = userSessions.stream()
                .map(s -> UserReportResponse.SessionSummary.builder()
                        .sessionPublicId(s.getPublicId())
                        .cashierName(s.getCashier().getName())
                        .openedAt(s.getOpenedAt())
                        .closedAt(s.getClosedAt())
                        .salesAmount(s.getTotalSales())
                        .orderCount((long) orders.stream().filter(o -> o.getCashierSession().equals(s)).count())
                        .build())
                .collect(Collectors.toList());

        Map<String, Integer> productCount = new HashMap<>();
        Map<String, Long> productSales = new HashMap<>();
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().forEach(item -> {
                    String productName = item.getProduct().getName();
                    productCount.put(productName, productCount.getOrDefault(productName, 0) + item.getQuantity());
                    productSales.put(productName,
                            productSales.getOrDefault(productName, 0L) + (item.getTotalPrice() != null ? item.getTotalPrice() : 0L));
                });
            }
        });

        List<UserReportResponse.ProductSummary> topProducts = productCount.keySet().stream()
                .sorted((a, b) -> Integer.compare(productCount.get(b), productCount.get(a)))
                .limit(10)
                .map(productName -> UserReportResponse.ProductSummary.builder()
                        .productName(productName)
                        .quantity(productCount.get(productName))
                        .totalAmount(productSales.get(productName))
                        .build())
                .collect(Collectors.toList());

        return UserReportResponse.builder()
                .userPublicId(user.getPublicId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalSales(totalSales)
                .totalOrders((long) orders.size())
                .totalDiscounts(totalDiscounts)
                .averageOrderValue(orders.isEmpty() ? 0 : totalSales / orders.size())
                .averageDiscount(averageDiscount)
                .cashiers(cashierSummaries)
                .sessions(sessionSummaries)
                .topProducts(topProducts)
                .build();
    }

    public ProductReportResponse getProductReport(LocalDateTime startDate, LocalDateTime endDate) {
        // Get all order items within the period
        List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                .filter(item -> item.getOrder() != null &&
                        item.getOrder().getCreatedAt().isAfter(startDate) &&
                        item.getOrder().getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        // Calculate totals
        Long totalRevenue = orderItems.stream()
                .mapToLong(item -> item.getTotalPrice() != null ? item.getTotalPrice() : 0L)
                .sum();

        Long totalQuantitySold = orderItems.stream()
                .mapToLong(OrderItem::getQuantity)
                .sum();

        Set<String> uniqueOrders = orderItems.stream()
                .map(item -> item.getOrder().getPublicId())
                .collect(Collectors.toSet());

        // Group by product
        Map<String, List<OrderItem>> productItemsMap = orderItems.stream()
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.groupingBy(item -> item.getProduct().getPublicId()));

        List<ProductReportResponse.ProductDetail> productDetails = productItemsMap.entrySet().stream()
                .map(entry -> {
                    List<OrderItem> items = entry.getValue();
                    Product product = items.get(0).getProduct();

                    Integer quantitySold = items.stream()
                            .mapToInt(OrderItem::getQuantity)
                            .sum();

                    Long revenue = items.stream()
                            .mapToLong(item -> item.getTotalPrice() != null ? item.getTotalPrice() : 0L)
                            .sum();

                    Long orderCount = items.stream()
                            .map(item -> item.getOrder().getPublicId())
                            .distinct()
                            .count();

                    Long averagePrice = quantitySold > 0 ? revenue / quantitySold : 0L;

                    return ProductReportResponse.ProductDetail.builder()
                            .productId(product.getPublicId())
                            .productName(product.getName())
                            .categoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A")
                            .quantitySold(quantitySold)
                            .totalRevenue(revenue)
                            .orderCount(orderCount)
                            .averagePrice(averagePrice)
                            .isAvailable(product.getAvailable())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalRevenue(), a.getTotalRevenue()))
                .collect(Collectors.toList());

        return ProductReportResponse.builder()
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalRevenue(totalRevenue)
                .totalQuantitySold(totalQuantitySold)
                .totalOrders((long) uniqueOrders.size())
                .totalProducts(productDetails.size())
                .products(productDetails)
                .build();
    }

    public TableReportResponse getTableReport(LocalDateTime startDate, LocalDateTime endDate) {
        // Get all orders within the period
        List<Order> orders = orderRepository.findAll().stream()
                .filter(order -> order.getCreatedAt().isAfter(startDate) &&
                        order.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        // Calculate totals
        Long totalRevenue = orders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        Long totalDiscounts = orders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        // Split by order type
        List<Order> tableOrders = orders.stream()
                .filter(o -> o.getOrderType() == OrderType.TABLE)
                .collect(Collectors.toList());

        List<Order> takeawayOrders = orders.stream()
                .filter(o -> o.getOrderType() == OrderType.TAKEAWAY)
                .collect(Collectors.toList());

        Long tableRevenue = tableOrders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        Long takeawayRevenue = takeawayOrders.stream()
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                .sum();

        // Group table orders by table
        Map<String, List<Order>> ordersByTable = tableOrders.stream()
                .filter(o -> o.getTable() != null)
                .collect(Collectors.groupingBy(o -> o.getTable().getPublicId()));

        List<TableReportResponse.TableDetail> tableDetails = ordersByTable.entrySet().stream()
                .map(entry -> {
                    List<Order> tableOrderList = entry.getValue();
                    RestaurantTable table = tableOrderList.get(0).getTable();

                    Long revenue = tableOrderList.stream()
                            .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0L)
                            .sum();

                    Long discounts = tableOrderList.stream()
                            .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                            .sum();

                    Long avgOrder = tableOrderList.size() > 0 ? revenue / tableOrderList.size() : 0L;

                    return TableReportResponse.TableDetail.builder()
                            .tableId(table.getPublicId())
                            .tableName(table.getName())
                            .tableNumber(table.getNumber())
                            .totalRevenue(revenue)
                            .orderCount((long) tableOrderList.size())
                            .averageOrderValue(avgOrder)
                            .totalDiscounts(discounts)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalRevenue(), a.getTotalRevenue()))
                .collect(Collectors.toList());

        // Takeaway summary
        Long takeawayDiscounts = takeawayOrders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        Long avgTakeaway = takeawayOrders.size() > 0 ? takeawayRevenue / takeawayOrders.size() : 0L;

        TableReportResponse.TableDetail takeawaySummary = TableReportResponse.TableDetail.builder()
                .tableId("takeaway")
                .tableName("À Emporter")
                .tableNumber("TAKEAWAY")
                .totalRevenue(takeawayRevenue)
                .orderCount((long) takeawayOrders.size())
                .averageOrderValue(avgTakeaway)
                .totalDiscounts(takeawayDiscounts)
                .build();

        return TableReportResponse.builder()
                .periodStart(startDate)
                .periodEnd(endDate)
                .totalRevenue(totalRevenue)
                .totalOrders((long) orders.size())
                .totalDiscounts(totalDiscounts)
                .averageOrderValue(orders.size() > 0 ? totalRevenue / orders.size() : 0L)
                .tableRevenue(tableRevenue)
                .tableOrders((long) tableOrders.size())
                .takeawayRevenue(takeawayRevenue)
                .takeawayOrders((long) takeawayOrders.size())
                .tables(tableDetails)
                .takeawaySummary(takeawaySummary)
                .build();
    }

    private GlobalSessionReportResponse.UserResponse toUserResponse(User user) {
        GlobalSessionReportResponse.UserResponse response = new GlobalSessionReportResponse.UserResponse();
        response.setPublicId(user.getPublicId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setUsername(user.getUsername());
        return response;
    }
}
