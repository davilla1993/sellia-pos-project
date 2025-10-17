package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Invoice;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.repository.InvoiceRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public Invoice createSessionInvoice(CustomerSession session, List<Order> orders, long totalFinalAmount) {
        // Calculate totals
        long subtotal = orders.stream()
                .mapToLong(Order::getTotalAmount)
                .sum();

        long totalDiscount = orders.stream()
                .mapToLong(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0L)
                .sum();

        // Simple tax calculation (can be made configurable)
        long taxAmount = 0;

        long finalAmount = subtotal - totalDiscount + taxAmount;

        // Generate unique invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Create invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customerSession(session)
                .orders(orders)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discountAmount(totalDiscount)
                .totalAmount(subtotal)
                .finalAmount(Math.max(0, finalAmount))
                .status(Invoice.InvoiceStatus.PAID)
                .customerName(session.getCustomerName())
                .customerPhone(session.getCustomerPhone())
                .paymentMethod("CASH") // Default, can be overridden
                .paidAt(LocalDateTime.now())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Update orders with invoice reference
        for (Order order : orders) {
            order.setInvoice(savedInvoice);
            orderRepository.save(order);
        }

        log.info("Invoice created: {} for session: {} with amount: {}", invoiceNumber, session.getPublicId(), finalAmount);

        return savedInvoice;
    }

    private String generateInvoiceNumber() {
        // Format: INV-YYYYMMDD-XXXXX
        String datePart = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        long sequencePart = System.currentTimeMillis() % 100000;
        return String.format("INV-%s-%05d", datePart, sequencePart);
    }
}
