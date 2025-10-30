package com.follysitou.sellia_backend.enums;

import lombok.Getter;

@Getter
public enum TicketStatus {
    PENDING("En attente"),              // Pas encore imprimé
    PRINTING("En impression"),          // Imprimante active
    PRINTED("Imprimé"),                 // Imprimé, en attente de préparation
    PREPARING("En préparation"),        // Au moins un item en préparation
    READY("Prêt"),                      // Tous les items prêts
    SERVED("Servi");                    // Remis au client

    private final String displayName;

    TicketStatus(String displayName) {
        this.displayName = displayName;
    }

}
