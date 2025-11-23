package com.follysitou.sellia_backend.enums;

import lombok.Getter;

@Getter
public enum RoleName {
    ADMIN("Administrateur"),
    CAISSE("Caisse"),
    CUISINE("Cuisine"),
    BAR("Bar"),
    AUDITOR("Auditeur");

    private final String displayName;

    RoleName(String displayName) {
        this.displayName = displayName;
    }

}
