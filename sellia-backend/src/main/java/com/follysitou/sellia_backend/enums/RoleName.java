package com.follysitou.sellia_backend.enums;

public enum RoleName {
    ADMIN("Administrateur"),
    CAISSIER("Caissier"),
    CUISINE("Cuisine");

    private final String displayName;

    RoleName(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
