package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CustomerSessionResponse {

    private String publicId;
    private String tablePublicId;
    private String tableNumber;
    private String customerName;
    private String customerPhone;
    private Boolean active;
    private LocalDateTime sessionStart;
    private LocalDateTime sessionEnd;
    private Boolean isPaid;
    private Long totalAmount;
    private LocalDateTime finalizedAt;
    private Integer numberOfCustomers;
    private String notes;
}
