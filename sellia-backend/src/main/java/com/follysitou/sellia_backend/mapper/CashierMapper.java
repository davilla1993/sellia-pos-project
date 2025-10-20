package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.CashierCreateRequest;
import com.follysitou.sellia_backend.dto.request.CashierUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CashierResponse;
import com.follysitou.sellia_backend.model.Cashier;
import com.follysitou.sellia_backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CashierMapper {

    private final UserMapper userMapper;

    public Cashier toEntity(CashierCreateRequest request) {
        return Cashier.builder()
                .name(request.getName())
                .cashierNumber(request.getCashierNumber())
                .pin(request.getPin())
                .description(request.getDescription())
                .location(request.getLocation())
                .assignedUsers(Set.of())
                .build();
    }

    public CashierResponse toResponse(Cashier cashier) {
        CashierResponse response = new CashierResponse();
        response.setPublicId(cashier.getPublicId());
        response.setName(cashier.getName());
        response.setCashierNumber(cashier.getCashierNumber());
        response.setStatus(cashier.getStatus());
        response.setFailedPinAttempts(cashier.getFailedPinAttempts());
        response.setLockedUntil(cashier.getLockedUntil());
        response.setDescription(cashier.getDescription());
        response.setLocation(cashier.getLocation());
        response.setAssignedUsers(
                cashier.getAssignedUsers().stream()
                        .map(userMapper::toResponse)
                        .collect(Collectors.toSet())
        );
        response.setCreatedAt(cashier.getCreatedAt());
        response.setUpdatedAt(cashier.getUpdatedAt());
        return response;
    }

    public void updateEntityFromRequest(CashierUpdateRequest request, Cashier cashier) {
        if (request.getName() != null) {
            cashier.setName(request.getName());
        }
        if (request.getDescription() != null) {
            cashier.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            cashier.setLocation(request.getLocation());
        }
    }
}
