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
    private long totalRevenue;
    private long totalTransactions;
    private long averageOrderValue;
    private long totalDiscounts;
    private double discountPercentage;
    private List<TopProductResponse> topProducts;
    private List<CashierPerformanceResponse> cashierPerformance;
    private List<RevenueByDayResponse> revenueByDay;
    private List<PeakHourResponse> peakHours;
}
