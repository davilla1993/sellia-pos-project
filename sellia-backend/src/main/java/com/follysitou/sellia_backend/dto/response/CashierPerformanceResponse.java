package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashierPerformanceResponse {
    private String name;
    private long transactions;
    private long revenue;
    private long average;
    private double percent;
}
