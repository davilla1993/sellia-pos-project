package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.enums.TicketStatus;
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
public class UnifiedTicketResponse {

    private String ticketPublicId;
    private String ticketNumber;
    private String sessionPublicId;
    private String tableNumber;
    private String customerName;
    
    // Tous les items groupés par WorkStation
    private Map<WorkStation, List<TicketItemDetail>> itemsByStation;
    
    // Vue d'ensemble
    private Integer totalItems;
    private Integer totalStations;
    
    // Statut global
    private TicketStatus status;
    private String message;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime printedAt;
    private LocalDateTime readyAt;
    private LocalDateTime servedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketItemDetail {
        private String itemPublicId;
        private WorkStation station;
        private String menuName;
        private String itemName;
        private Integer quantity;
        private String notes;
        private String status;  // PENDING, READY, SERVED
    }
}
