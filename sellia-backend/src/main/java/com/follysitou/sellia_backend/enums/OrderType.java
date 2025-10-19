package com.follysitou.sellia_backend.enums;

public enum OrderType {
    TABLE("Table"),
    TAKEAWAY("À Emporter");

    private final String displayName;

    OrderType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
