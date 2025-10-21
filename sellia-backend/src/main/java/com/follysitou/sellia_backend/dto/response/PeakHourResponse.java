package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakHourResponse {
    private String time;
    private long transactions;
    private double intensity;
}
