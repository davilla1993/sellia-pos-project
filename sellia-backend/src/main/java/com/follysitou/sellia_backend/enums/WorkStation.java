package com.follysitou.sellia_backend.enums;

public enum WorkStation {
    KITCHEN("Cuisine"),
    BAR("Bar"),
    PASTRY("Pâtisserie"),
    CHECKOUT("Caisse");

    private final String displayName;

    WorkStation(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
