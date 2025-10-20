package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.CashierSessionResponse;
import com.follysitou.sellia_backend.model.CashierSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CashierSessionMapper {

    private final CashierMapper cashierMapper;
    private final UserMapper userMapper;

    public CashierSessionResponse toResponse(CashierSession session) {
        CashierSessionResponse response = new CashierSessionResponse();
        response.setPublicId(session.getPublicId());
        response.setGlobalSessionPublicId(session.getGlobalSession().getPublicId());
        response.setCashier(cashierMapper.toResponse(session.getCashier()));
        response.setUser(userMapper.toResponse(session.getUser()));
        response.setStatus(session.getStatus());
        response.setOpenedAt(session.getOpenedAt());
        response.setLockedAt(session.getLockedAt());
        response.setUnlockedAt(session.getUnlockedAt());
        response.setClosedAt(session.getClosedAt());
        response.setInitialAmount(session.getInitialAmount());
        response.setFinalAmount(session.getFinalAmount());
        response.setTotalSales(session.getTotalSales());
        response.setLastActivityAt(session.getLastActivityAt());
        response.setInactivityLockMinutes(session.getInactivityLockMinutes());
        response.setNotes(session.getNotes());
        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        return response;
    }
}
