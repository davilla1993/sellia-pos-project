package com.follysitou.sellia_backend.enums;

public enum OrderItemStatus {
    PENDING("En attente"),
    SENT_TO_STATION("Envoyé à la station"),
    PREPARING("En préparation"),
    READY("Prêt"),
    SERVED("Servi");

    private final String displayName;

    OrderItemStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
