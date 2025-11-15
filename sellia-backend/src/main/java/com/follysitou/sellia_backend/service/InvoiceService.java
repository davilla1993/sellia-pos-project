package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.response.InvoiceDetailResponse;
import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Invoice;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.model.OrderItem;
import com.follysitou.sellia_backend.repository.InvoiceRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

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

    /**
     * Create an invoice for a single order (admin/cashier direct payment)
     */
    public Invoice createOrderInvoice(Order order, String paymentMethod) {
        // Calculate totals
        long subtotal = order.getTotalAmount();
        long totalDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : 0L;
        long taxAmount = 0;
        long finalAmount = subtotal - totalDiscount + taxAmount;

        // Generate unique invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Create invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customerSession(order.getCustomerSession())
                .orders(List.of(order))
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discountAmount(totalDiscount)
                .totalAmount(subtotal)
                .finalAmount(Math.max(0, finalAmount))
                .status(Invoice.InvoiceStatus.PAID)
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .paymentMethod(paymentMethod)
                .paidAt(LocalDateTime.now())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Update order with invoice reference
        order.setInvoice(savedInvoice);
        orderRepository.save(order);

        log.info("Invoice created: {} for order: {} with amount: {}", invoiceNumber, order.getOrderNumber(), finalAmount);

        return savedInvoice;
    }

    private String generateInvoiceNumber() {
        // Format: INV-YYYYMMDD-XXXXX
        String datePart = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        long sequencePart = System.currentTimeMillis() % 100000;
        return String.format("INV-%s-%05d", datePart, sequencePart);
    }

    /**
     * Récupère les détails de la facture avec les items groupés par WorkStation (CUISINE & BAR)
     */
    public InvoiceDetailResponse getInvoiceDetailBySession(String sessionPublicId) {
        // Récupérer la facture de la session avec les informations de caisse chargées
        Invoice invoice = invoiceRepository.findByCustomerSessionPublicIdWithCashierInfo(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for session: " + sessionPublicId));

        // Récupérer toutes les commandes de la facture
        List<Order> orders = invoice.getOrders();

        // Récupérer le numéro de caisse depuis la première commande qui a une cashierSession
        String cashRegisterNumber = null;
        for (Order order : orders) {
            if (order.getCashierSession() != null && order.getCashierSession().getCashier() != null) {
                cashRegisterNumber = order.getCashierSession().getCashier().getCashierNumber();
                break;
            }
        }

        // Regrouper tous les OrderItems par WorkStation
        Map<String, List<InvoiceDetailResponse.InvoiceItemDetail>> itemsByStation = new LinkedHashMap<>();

        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    // Déterminer le WorkStation (CUISINE ou BAR)
                    String stationKey = item.getWorkStation() == WorkStation.CUISINE ? "CUISINE" : "BAR";

                    // Créer le détail de l'item
                    InvoiceDetailResponse.InvoiceItemDetail itemDetail = InvoiceDetailResponse.InvoiceItemDetail.builder()
                            .itemName(item.getMenuItem() != null ? item.getMenuItem().getMenu().getName() : item.getProduct().getName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .totalPrice(item.getTotalPrice())
                            .specialInstructions(item.getSpecialInstructions())
                            .build();

                    // Ajouter à la liste de la station correspondante
                    itemsByStation.computeIfAbsent(stationKey, k -> new ArrayList<>()).add(itemDetail);
                }
            }
        }

        // Construire la réponse
        return InvoiceDetailResponse.builder()
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerName(invoice.getCustomerName())
                .customerPhone(invoice.getCustomerPhone())
                .tableNumber(invoice.getCustomerSession().getTable() != null ?
                        invoice.getCustomerSession().getTable().getNumber() : "N/A")
                .cashRegisterNumber(cashRegisterNumber)
                .createdAt(invoice.getCreatedAt())
                .paidAt(invoice.getPaidAt())
                .itemsByStation(itemsByStation)
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .discountAmount(invoice.getDiscountAmount())
                .finalAmount(invoice.getFinalAmount())
                .paymentMethod(invoice.getPaymentMethod())
                .status(invoice.getStatus().toString())
                .build();
    }
}
