package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.CashierSessionResponse;
import com.follysitou.sellia_backend.enums.CashOperationType;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.repository.CashOperationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CashierSessionMapper {

    private final CashierMapper cashierMapper;
    private final UserMapper userMapper;
    private final CashOperationRepository cashOperationRepository;

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

        // Calculate cash operations totals
        Long totalEntrees = cashOperationRepository.getTotalBySessionAndType(session.getPublicId(), CashOperationType.ENTREE);
        Long totalSorties = cashOperationRepository.getTotalBySessionAndType(session.getPublicId(), CashOperationType.SORTIE);
        response.setTotalCashEntrees(totalEntrees);
        response.setTotalCashSorties(totalSorties);

        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        return response;
    }
}
