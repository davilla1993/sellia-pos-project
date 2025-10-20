package com.follysitou.sellia_backend.dto.request;

import lombok.Data;

@Data
public class CashierSessionCloseRequest {

    private Long finalAmount = 0L;

    private String notes;
}
