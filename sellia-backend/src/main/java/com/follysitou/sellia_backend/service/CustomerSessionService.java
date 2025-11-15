package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CustomerSessionCreateRequest;
import com.follysitou.sellia_backend.dto.response.CustomerSessionResponse;
import com.follysitou.sellia_backend.exception.BusinessException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.CustomerSessionMapper;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Invoice;
import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.InvoiceRepository;
import com.follysitou.sellia_backend.repository.OrderRepository;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerSessionService {

    private final CustomerSessionRepository customerSessionRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerSessionMapper customerSessionMapper;
    private final InvoiceService invoiceService;

    public CustomerSessionResponse getOrCreateSession(CustomerSessionCreateRequest request) {
        // Handle TABLE order type
        if (request.getOrderType() == null || request.getOrderType().name().equals("TABLE")) {
            if (request.getTablePublicId() == null || request.getTablePublicId().isBlank()) {
                throw new BusinessException("Table ID is required for table orders");
            }

            RestaurantTable table = restaurantTableRepository.findByPublicId(request.getTablePublicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

            // Check if an active session already exists for this table
            var existingSession = customerSessionRepository.findActiveByTable(table.getPublicId());

            if (existingSession.isPresent()) {
                log.info("Returning existing active session for table: {}", table.getNumber());
                return customerSessionMapper.toResponse(existingSession.get());
            }

            // Create new table session
            CustomerSession newSession = CustomerSession.builder()
                    .table(table)
                    .orderType(com.follysitou.sellia_backend.enums.OrderType.TABLE)
                    .customerName(request.getCustomerName())
                    .customerPhone(request.getCustomerPhone())
                    .active(true)
                    .sessionStart(LocalDateTime.now())
                    .isPaid(false)
                    .totalAmount(0L)
                    .numberOfCustomers(1)
                    .build();

            CustomerSession savedSession = customerSessionRepository.save(newSession);
            log.info("New customer session created: {} for table {}", savedSession.getPublicId(), table.getNumber());

            return customerSessionMapper.toResponse(savedSession);
        }

        // Handle TAKEAWAY order type
        else if (request.getOrderType().name().equals("TAKEAWAY")) {
            // Customer name and phone are optional for takeaway orders
            // Use "TAKEAWAY" as default if no name provided
            String customerName = (request.getCustomerName() != null && !request.getCustomerName().isBlank())
                    ? request.getCustomerName()
                    : "TAKEAWAY";

            // For takeaway, create a new session (no check for existing session)
            // Each takeaway order can be separate or grouped by phone number if provided
            CustomerSession newSession = CustomerSession.builder()
                    .table(null) // No table for takeaway
                    .orderType(com.follysitou.sellia_backend.enums.OrderType.TAKEAWAY)
                    .customerName(customerName)
                    .customerPhone(request.getCustomerPhone())
                    .active(true)
                    .sessionStart(LocalDateTime.now())
                    .isPaid(false)
                    .totalAmount(0L)
                    .numberOfCustomers(1)
                    .build();

            CustomerSession savedSession = customerSessionRepository.save(newSession);
            log.info("New takeaway session created: {} for customer {}", savedSession.getPublicId(), customerName);

            return customerSessionMapper.toResponse(savedSession);
        }

        throw new BusinessException("Invalid order type");
    }

    public CustomerSessionResponse getSessionById(String sessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        return customerSessionMapper.toResponse(session);
    }

    public List<Order> getSessionOrders(String sessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        return orderRepository.findByCustomerSessionId(sessionPublicId, Pageable.unpaged())
                .stream()
                .toList();
    }

    public Page<Order> getSessionOrdersPaginated(String sessionPublicId, Pageable pageable) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        return orderRepository.findByCustomerSessionIdWithCashierInfo(sessionPublicId, pageable);
    }

    public CustomerSessionResponse finalizeSession(String sessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        if (!session.getActive()) {
            throw new BusinessException("Session is already finalized");
        }

        // Get all orders for this session
        List<Order> orders = orderRepository.findByCustomerSessionId(sessionPublicId, Pageable.unpaged())
                .stream()
                .toList();

        if (orders.isEmpty()) {
            throw new BusinessException("Cannot finalize session without orders");
        }

        // Calculate total amount
        long totalAmount = orders.stream()
                .mapToLong(o -> {
                    long amount = o.getTotalAmount();
                    if (o.getDiscountAmount() != null) {
                        amount -= o.getDiscountAmount();
                    }
                    return Math.max(0, amount);
                })
                .sum();

        // Create invoice
        Invoice invoice = invoiceService.createSessionInvoice(session, orders, totalAmount);

        // Mark session as finalized
        session.setActive(false);
        session.setSessionEnd(LocalDateTime.now());
        session.setIsPaid(true);
        session.setTotalAmount(totalAmount);
        session.setFinalizedAt(LocalDateTime.now());

        CustomerSession updated = customerSessionRepository.save(session);
        log.info("Customer session finalized: {} with invoice: {}", sessionPublicId, invoice.getInvoiceNumber());

        return customerSessionMapper.toResponse(updated);
    }

    public CustomerSessionResponse updateSessionInfo(String sessionPublicId, String customerName, String customerPhone) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        if (!session.getActive()) {
            throw new BusinessException("Cannot update finalized session");
        }

        if (customerName != null && !customerName.isBlank()) {
            session.setCustomerName(customerName);
        }
        if (customerPhone != null && !customerPhone.isBlank()) {
            session.setCustomerPhone(customerPhone);
        }

        CustomerSession updated = customerSessionRepository.save(session);
        log.info("Customer session info updated: {}", sessionPublicId);

        return customerSessionMapper.toResponse(updated);
    }

    public void validateSessionIsActive(String sessionPublicId) {
        CustomerSession session = customerSessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer session not found"));

        if (!session.getActive()) {
            throw new BusinessException("This session has been finalized and cannot accept new orders");
        }
    }

    public CustomerSessionResponse getActiveSessionByTable(String tablePublicId) {
        RestaurantTable table = restaurantTableRepository.findByPublicId(tablePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        CustomerSession session = customerSessionRepository.findActiveByTableWithCashierInfo(tablePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("No active session found for this table"));

        return customerSessionMapper.toResponse(session);
    }
}
