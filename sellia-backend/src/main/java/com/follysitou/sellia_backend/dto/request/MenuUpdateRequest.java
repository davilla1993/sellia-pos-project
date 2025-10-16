package com.follysitou.sellia_backend.dto.request;

import com.follysitou.sellia_backend.enums.MenuType;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MenuUpdateRequest {

    @Size(max = 100, message = "Menu name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private MenuType menuType;

    private Boolean active;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String imageUrl;
}
