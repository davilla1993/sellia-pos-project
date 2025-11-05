package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.CashOperationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CashOperationResponse {

    private String publicId;
    private String cashierSessionPublicId;
    private String cashierName;
    private String userName;
    private CashOperationType type;
    private Long amount;
    private String description;
    private String reference;
    private String authorizedBy;
    private LocalDateTime operationDate;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
