package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.GlobalSessionResponse;
import com.follysitou.sellia_backend.model.GlobalSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GlobalSessionMapper {

    private final UserMapper userMapper;

    public GlobalSessionResponse toResponse(GlobalSession session) {
        GlobalSessionResponse response = new GlobalSessionResponse();
        response.setPublicId(session.getPublicId());
        response.setStatus(session.getStatus());
        response.setOpenedAt(session.getOpenedAt());
        response.setClosedAt(session.getClosedAt());
        response.setOpenedBy(userMapper.toResponse(session.getOpenedBy()));
        if (session.getClosedBy() != null) {
            response.setClosedBy(userMapper.toResponse(session.getClosedBy()));
        }
        response.setInitialAmount(session.getInitialAmount());
        response.setFinalAmount(session.getFinalAmount());
        response.setTotalSales(session.getTotalSales());
        response.setReconciliationNotes(session.getReconciliationNotes());
        response.setReconciliationAmount(session.getReconciliationAmount());
        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        return response;
    }
}
