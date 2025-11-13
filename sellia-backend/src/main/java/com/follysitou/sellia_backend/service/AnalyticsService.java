package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.response.*;
import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import com.follysitou.sellia_backend.repository.OrderRepository;
import com.follysitou.sellia_backend.repository.OrderItemRepository;
import com.follysitou.sellia_backend.repository.CashierSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CashierSessionRepository cashierSessionRepository;

    public AnalyticsSummaryResponse getSummary(LocalDate dateStart, LocalDate dateEnd) {
        log.info("Fetching analytics summary from {} to {}", dateStart, dateEnd);

        LocalDateTime startDateTime = dateStart.atStartOfDay();
        LocalDateTime endDateTime = dateEnd.atTime(23, 59, 59);

        // Calculate KPIs for paid orders (Chiffre d'affaires) - handle null returns
        Long revenueResult = orderRepository.sumRevenueByDateRange(startDateTime, endDateTime);
        long totalRevenue = revenueResult != null ? revenueResult : 0L;

        long totalTransactions = orderRepository.countByDateRange(startDateTime, endDateTime);

        Long discountsResult = orderRepository.sumDiscountsByDateRange(startDateTime, endDateTime);
        long totalDiscounts = discountsResult != null ? discountsResult : 0L;

        long averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        double discountPercentage = totalRevenue > 0 ? (totalDiscounts * 100.0 / (totalRevenue + totalDiscounts)) : 0;

        // Calculate orders placed (all created orders)
        long ordersPlaced = orderRepository.countOrdersPlaced(startDateTime, endDateTime);
        Long ordersPlacedAmountResult = orderRepository.sumOrdersPlacedAmount(startDateTime, endDateTime);
        long ordersPlacedAmount = ordersPlacedAmountResult != null ? ordersPlacedAmountResult : 0L;

        // Calculate cancelled orders
        long cancelledOrders = orderRepository.countCancelledOrders(startDateTime, endDateTime);
        Long cancelledOrdersAmountResult = orderRepository.sumCancelledOrdersAmount(startDateTime, endDateTime);
        long cancelledOrdersAmount = cancelledOrdersAmountResult != null ? cancelledOrdersAmountResult : 0L;

        // Calculate delivered orders
        long deliveredOrders = orderRepository.countDeliveredOrders(startDateTime, endDateTime);
        Long deliveredOrdersAmountResult = orderRepository.sumDeliveredOrdersAmount(startDateTime, endDateTime);
        long deliveredOrdersAmount = deliveredOrdersAmountResult != null ? deliveredOrdersAmountResult : 0L;

        // Get top products
        List<TopProductResponse> topProducts = getTopProducts(startDateTime, endDateTime);

        // Get cashier performance
        List<CashierPerformanceResponse> cashierPerformance = getCashierPerformance(startDateTime, endDateTime);

        // Get revenue by day
        List<RevenueByDayResponse> revenueByDay = getRevenueByDay(dateStart, dateEnd);

        // Get peak hours
        List<PeakHourResponse> peakHours = getPeakHours(startDateTime, endDateTime);

        return AnalyticsSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTransactions)
                .averageOrderValue(averageOrderValue)
                .totalDiscounts(totalDiscounts)
                .discountPercentage(discountPercentage)
                .ordersPlaced(ordersPlaced)
                .ordersPlacedAmount(ordersPlacedAmount)
                .cancelledOrders(cancelledOrders)
                .cancelledOrdersAmount(cancelledOrdersAmount)
                .deliveredOrders(deliveredOrders)
                .deliveredOrdersAmount(deliveredOrdersAmount)
                .topProducts(topProducts)
                .cashierPerformance(cashierPerformance)
                .revenueByDay(revenueByDay)
                .peakHours(peakHours)
                .build();
    }

    private List<TopProductResponse> getTopProducts(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        List<Object[]> results = orderItemRepository.getTopProductsByRevenue(startDateTime, endDateTime, 10);
        List<TopProductResponse> topProducts = new ArrayList<>();

        for (Object[] row : results) {
            String productName = (String) row[0];
            long quantity = ((Number) row[1]).longValue();
            long revenue = ((Number) row[2]).longValue();

            topProducts.add(TopProductResponse.builder()
                    .name(productName)
                    .quantity(quantity)
                    .revenue(revenue)
                    .build());
        }

        return topProducts;
    }

    private List<CashierPerformanceResponse> getCashierPerformance(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // Query cashier performance from orders grouped by cashier_session
        List<Object[]> results = orderRepository.getCashierPerformanceStats(startDateTime, endDateTime);
        List<CashierPerformanceResponse> performances = new ArrayList<>();
        
        if (results.isEmpty()) {
            return performances;
        }
        
        long totalRevenue = results.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();
        
        for (Object[] row : results) {
            String cashierName = (String) row[0];
            long revenue = ((Number) row[1]).longValue();
            long transactions = ((Number) row[2]).longValue();
            long average = transactions > 0 ? revenue / transactions : 0;
            double percent = totalRevenue > 0 ? (revenue * 100.0 / totalRevenue) : 0;
            
            performances.add(CashierPerformanceResponse.builder()
                    .name(cashierName != null ? cashierName : "Anonyme")
                    .transactions(transactions)
                    .revenue(revenue)
                    .average(average)
                    .percent(percent)
                    .build());
        }
        
        // Sort by revenue descending
        performances.sort((a, b) -> Long.compare(b.getRevenue(), a.getRevenue()));
        
        return performances;
    }

    private List<RevenueByDayResponse> getRevenueByDay(LocalDate dateStart, LocalDate dateEnd) {
        List<RevenueByDayResponse> result = new ArrayList<>();

        for (LocalDate date = dateStart; !date.isAfter(dateEnd); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);
            Long revenueResult = orderRepository.sumRevenueByDateRange(dayStart, dayEnd);
            long revenue = revenueResult != null ? revenueResult : 0L;

            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.FRENCH);
            result.add(RevenueByDayResponse.builder()
                    .date(dayName)
                    .amount(revenue)
                    .build());
        }

        return result;
    }

    private List<PeakHourResponse> getPeakHours(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        List<PeakHourResponse> result = new ArrayList<>();
        long maxTransactions = 0;
        
        // Get transactions by hour
        Map<Integer, Long> hourTransactions = new HashMap<>();
        for (int hour = 8; hour <= 20; hour++) {
            long count = orderRepository.countByHourRange(startDateTime, endDateTime, hour);
            hourTransactions.put(hour, count);
            maxTransactions = Math.max(maxTransactions, count);
        }
        
        // Calculate intensity and create response
        final long max = maxTransactions;
        hourTransactions.forEach((hour, count) -> {
            double intensity = max > 0 ? (double) count / max : 0;
            String timeRange = String.format("%02dh-%02dh", hour, hour + 1);
            result.add(PeakHourResponse.builder()
                    .time(timeRange)
                    .transactions(count)
                    .intensity(intensity)
                    .build());
        });
        
        return result;
    }

    public long getActiveSessions() {
        return cashierSessionRepository.countOpenSessions();
    }
}
