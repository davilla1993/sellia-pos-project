package com.follysitou.sellia_backend.enums;

import lombok.Getter;

@Getter
public enum WorkStation {
    KITCHEN("Cuisine"),
    BAR("Bar"),
    PASTRY("Pâtisserie"),
    CHECKOUT("Caisse");

    private final String displayName;

    WorkStation(String displayName) {
        this.displayName = displayName;
    }

}
