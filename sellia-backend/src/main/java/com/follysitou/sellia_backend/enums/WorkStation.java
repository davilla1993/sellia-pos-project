package com.follysitou.sellia_backend.enums;

import lombok.Getter;

@Getter
public enum WorkStation {
    CUISINE("Cuisine"),
    BAR("Bar");

    private final String displayName;

    WorkStation(String displayName) {
        this.displayName = displayName;
    }

}
