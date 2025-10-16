package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "settings", indexes = {
        @Index(name = "idx_setting_key", columnList = "settingKey"),
        @Index(name = "idx_setting_category", columnList = "category")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Setting extends BaseEntity {

    @Column(name = "setting_key", nullable = false, unique = true)
    private String settingKey;

    @Column(nullable = false)
    private String value;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String category;

    private String description;

    @Column(nullable = false)
    private Boolean editable = true;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "validation_regex")
    private String validationRegex;

    @Column(name = "min_value")
    private Long minValue;

    @Column(name = "max_value")
    private Long maxValue;
}
