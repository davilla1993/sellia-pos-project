package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CashOperationCreateRequest;
import com.follysitou.sellia_backend.dto.request.CashOperationUpdateAdminNotesRequest;
import com.follysitou.sellia_backend.dto.response.CashOperationResponse;
import com.follysitou.sellia_backend.dto.response.CashOperationTotalsResponse;
import com.follysitou.sellia_backend.enums.CashOperationType;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.CashOperationMapper;
import com.follysitou.sellia_backend.model.CashOperation;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.CashOperationRepository;
import com.follysitou.sellia_backend.repository.CashierSessionRepository;
import com.follysitou.sellia_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashOperationService {

    private final CashOperationRepository cashOperationRepository;
    private final CashOperationMapper cashOperationMapper;
    private final CashierSessionRepository cashierSessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public CashOperationResponse createCashOperation(CashOperationCreateRequest request) {
        // Get cashier session
        CashierSession session = cashierSessionRepository.findByPublicId(request.getCashierSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("CashierSession", "publicId", request.getCashierSessionId()));

        // Get current user
        User currentUser = getCurrentUser();

        // Create cash operation
        CashOperation cashOperation = CashOperation.builder()
                .cashierSession(session)
                .user(currentUser)
                .type(request.getType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .reference(request.getReference())
                .authorizedBy(request.getAuthorizedBy())
                .operationDate(LocalDateTime.now())
                .build();

        CashOperation saved = cashOperationRepository.save(cashOperation);
        return cashOperationMapper.toResponse(saved);
    }

    @Transactional
    public CashOperationResponse updateAdminNotes(String publicId, CashOperationUpdateAdminNotesRequest request) {
        CashOperation cashOperation = getCashOperationEntityById(publicId);
        cashOperation.setAdminNotes(request.getAdminNotes());
        CashOperation updated = cashOperationRepository.save(cashOperation);
        return cashOperationMapper.toResponse(updated);
    }

    public List<CashOperationResponse> getOperationsBySession(String sessionId) {
        List<CashOperation> operations = cashOperationRepository.findByCashierSession(sessionId);
        return operations.stream()
                .map(cashOperationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public Page<CashOperationResponse> getOperationsBySessionPaged(String sessionId, Pageable pageable) {
        Page<CashOperation> operations = cashOperationRepository.findByCashierSessionPaged(sessionId, pageable);
        return operations.map(cashOperationMapper::toResponse);
    }

    public Page<CashOperationResponse> getAllOperations(Pageable pageable) {
        Page<CashOperation> operations = cashOperationRepository.findAllActive(pageable);
        return operations.map(cashOperationMapper::toResponse);
    }

    public Page<CashOperationResponse> getOperationsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<CashOperation> operations = cashOperationRepository.findByDateRange(startDate, endDate, pageable);
        return operations.map(cashOperationMapper::toResponse);
    }

    public Page<CashOperationResponse> getOperationsByCashier(String cashierId, Pageable pageable) {
        Page<CashOperation> operations = cashOperationRepository.findByCashier(cashierId, pageable);
        return operations.map(cashOperationMapper::toResponse);
    }

    public CashOperationResponse getOperationById(String publicId) {
        CashOperation cashOperation = getCashOperationEntityById(publicId);
        return cashOperationMapper.toResponse(cashOperation);
    }

    public CashOperationTotalsResponse getTotalsBySession(String sessionId) {
        Long totalEntrees = cashOperationRepository.getTotalBySessionAndType(sessionId, CashOperationType.ENTREE);
        Long totalSorties = cashOperationRepository.getTotalBySessionAndType(sessionId, CashOperationType.SORTIE);
        Integer entreesCount = cashOperationRepository.getCountBySessionAndType(sessionId, CashOperationType.ENTREE);
        Integer sortiesCount = cashOperationRepository.getCountBySessionAndType(sessionId, CashOperationType.SORTIE);

        Long netAmount = totalEntrees - totalSorties;

        return new CashOperationTotalsResponse(
                totalEntrees,
                totalSorties,
                netAmount,
                entreesCount,
                sortiesCount
        );
    }

    @Transactional
    public void deleteCashOperation(String publicId) {
        CashOperation cashOperation = getCashOperationEntityById(publicId);
        cashOperation.setDeleted(true);
        cashOperationRepository.save(cashOperation);
    }

    private CashOperation getCashOperationEntityById(String publicId) {
        return cashOperationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CashOperation", "publicId", publicId));
    }

    private User getCurrentUser() {
        String userId = com.follysitou.sellia_backend.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new com.follysitou.sellia_backend.exception.UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", userId));
    }
}
