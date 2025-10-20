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
public class SessionTicketsResponse {

    private String sessionPublicId;
    private String tableNumber;
    private String customerName;
    
    // Tickets groupés par WorkStation
    private Map<WorkStation, StationTicketInfo> ticketsByStation;
    
    // Vue d'ensemble
    private Integer totalStations;
    private Integer readyStations;
    private Integer preparingStations;
    private Integer pendingStations;
    
    // Progression: 0-100%
    private Integer progressPercentage;
    
    // État global de la session
    private SessionStatus sessionStatus;
    
    // Message pour le serveur
    private String serverMessage;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime firstTicketPrintedAt;
    private LocalDateTime allReadyAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StationTicketInfo {
        private String ticketPublicId;
        private WorkStation station;
        private TicketStatus status;
        private Integer itemCount;
        private List<TicketItemInfo> items;
        private String message;
        private Integer priority;
        private LocalDateTime printedAt;
        private LocalDateTime readyAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketItemInfo {
        private String publicId;
        private String itemName;
        private Integer quantity;
        private String notes;
    }

    public enum SessionStatus {
        PENDING("En attente"),              // Aucun ticket imprimé
        PRINTING("En impression"),          // Au moins un ticket en impression
        PREPARING("En préparation"),        // Au moins une station prépare
        PARTIALLY_READY("Partiellement prêt"), // Au moins une station prête
        READY("Complètement prêt"),         // Toutes les stations prêtes
        SERVED("Servi");                    // Tous les tickets servis

        private final String displayName;

        SessionStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
