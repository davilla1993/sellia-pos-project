package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.CashierStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class CashierResponse {

    private String publicId;
    private String name;
    private String cashierNumber;
    private CashierStatus status;
    private Set<UserResponse> assignedUsers;
    private Integer failedPinAttempts;
    private LocalDateTime lockedUntil;
    private String description;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
