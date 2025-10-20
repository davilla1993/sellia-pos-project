package com.follysitou.sellia_backend.enums;

public enum TicketMode {
    SEPARATED("Tickets séparés par station"),
    UNIFIED("Ticket unifié avec tous les items");

    private final String displayName;

    TicketMode(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
