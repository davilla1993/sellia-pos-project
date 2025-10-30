package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.WorkStation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailResponse {

    private String invoiceNumber;
    private String customerName;
    private String customerPhone;
    private String tableNumber;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    // Items groupés par WorkStation
    private Map<String, List<InvoiceItemDetail>> itemsByStation;

    // Totaux
    private Long subtotal;
    private Long taxAmount;
    private Long discountAmount;
    private Long finalAmount;

    private String paymentMethod;
    private String status;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemDetail {
        private String itemName;
        private Integer quantity;
        private Long unitPrice;
        private Long totalPrice;
        private String specialInstructions;
    }
}
