package com.follysitou.sellia_backend.enums;

import lombok.Getter;

@Getter
public enum OrderType {
    TABLE("Table"),
    TAKEAWAY("À Emporter");

    private final String displayName;

    OrderType(String displayName) {
        this.displayName = displayName;
    }

}
