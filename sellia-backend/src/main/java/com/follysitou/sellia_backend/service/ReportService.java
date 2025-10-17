package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.repository.OrderRepository;
import com.follysitou.sellia_backend.repository.OrderItemRepository;
import com.follysitou.sellia_backend.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InvoiceRepository invoiceRepository;

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
}
