package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.response.*;
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

        // Calculate KPIs
        long totalRevenue = orderRepository.sumRevenueByDateRange(startDateTime, endDateTime);
        long totalTransactions = orderRepository.countByDateRange(startDateTime, endDateTime);
        long totalDiscounts = orderRepository.sumDiscountsByDateRange(startDateTime, endDateTime);
        long averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        double discountPercentage = totalRevenue > 0 ? (totalDiscounts * 100.0 / (totalRevenue + totalDiscounts)) : 0;

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
                .topProducts(topProducts)
                .cashierPerformance(cashierPerformance)
                .revenueByDay(revenueByDay)
                .peakHours(peakHours)
                .build();
    }

    private List<TopProductResponse> getTopProducts(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // TODO: Implement query to get top products from order_items joined with products
        // For now, return empty list - implement when order_items table is available
        return new ArrayList<>();
    }

    private List<CashierPerformanceResponse> getCashierPerformance(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // TODO: Implement query to get cashier performance from cashier_sessions and orders
        // For now, return empty list
        return new ArrayList<>();
    }

    private List<RevenueByDayResponse> getRevenueByDay(LocalDate dateStart, LocalDate dateEnd) {
        List<RevenueByDayResponse> result = new ArrayList<>();
        
        for (LocalDate date = dateStart; !date.isAfter(dateEnd); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);
            long revenue = orderRepository.sumRevenueByDateRange(dayStart, dayEnd);
            
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
        return cashierSessionRepository.countByStatus("OPEN");
    }
}
