package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    // Chiffre d'affaires (commandes encaissées)
    private long totalRevenue;
    private long totalTransactions;
    private long averageOrderValue;
    private long totalDiscounts;
    private double discountPercentage;

    // Commandes passées (toutes les commandes créées)
    private long ordersPlaced;
    private long ordersPlacedAmount;

    // Commandes annulées
    private long cancelledOrders;
    private long cancelledOrdersAmount;

    // Commandes livrées
    private long deliveredOrders;
    private long deliveredOrdersAmount;

    private List<TopProductResponse> topProducts;
    private List<CashierPerformanceResponse> cashierPerformance;
    private List<RevenueByDayResponse> revenueByDay;
    private List<PeakHourResponse> peakHours;
}
