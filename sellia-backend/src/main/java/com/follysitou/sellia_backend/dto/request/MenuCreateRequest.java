package com.follysitou.sellia_backend.dto.request;

import com.follysitou.sellia_backend.enums.MenuType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
public class MenuCreateRequest {

    @NotBlank(message = "Menu name is required")
    @Size(max = 100, message = "Menu name must not exceed 100 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Menu type is required")
    private MenuType menuType;

    @Min(value = 0L, message = "Bundle price cannot be negative")
    private Long bundlePrice;

    private Boolean active = true;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private MultipartFile image;
}
