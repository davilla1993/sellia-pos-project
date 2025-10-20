package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CashierChangePinRequest;
import com.follysitou.sellia_backend.dto.request.CashierCreateRequest;
import com.follysitou.sellia_backend.dto.request.CashierUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CashierResponse;
import com.follysitou.sellia_backend.enums.CashierStatus;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.CashierMapper;
import com.follysitou.sellia_backend.model.Cashier;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.CashierRepository;
import com.follysitou.sellia_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashierService {

    private final CashierRepository cashierRepository;
    private final UserRepository userRepository;
    private final CashierMapper cashierMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CashierResponse createCashier(CashierCreateRequest request) {
        if (cashierRepository.findByCashierNumber(request.getCashierNumber()).isPresent()) {
            throw new ConflictException(
                    "cashierNumber",
                    request.getCashierNumber(),
                    "Cashier number already exists"
            );
        }

        validatePin(request.getPin());

        Cashier cashier = cashierMapper.toEntity(request);
        cashier.setPin(passwordEncoder.encode(request.getPin()));
        cashier.setStatus(CashierStatus.ACTIVE);
        cashier.setFailedPinAttempts(0);

        if (request.getAssignedUserIds() != null && !request.getAssignedUserIds().isEmpty()) {
            Set<User> users = new HashSet<>();
            for (String userId : request.getAssignedUserIds()) {
                User user = userRepository.findByPublicId(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", userId));
                users.add(user);
            }
            cashier.setAssignedUsers(users);
        }

        Cashier savedCashier = cashierRepository.save(cashier);
        return cashierMapper.toResponse(savedCashier);
    }

    public CashierResponse getCashierById(String publicId) {
        Cashier cashier = getCashierEntityById(publicId);
        return cashierMapper.toResponse(cashier);
    }

    public Page<CashierResponse> getAllCashiers(Pageable pageable) {
        Page<Cashier> cashiers = cashierRepository.findAllActive(pageable);
        return cashiers.map(cashierMapper::toResponse);
    }

    public Page<CashierResponse> getCashiersByUser(String userId, Pageable pageable) {
        Page<Cashier> cashiers = cashierRepository.findByAssignedUserId(userId, pageable);
        return cashiers.map(cashierMapper::toResponse);
    }

    @Transactional
    public CashierResponse updateCashier(String publicId, CashierUpdateRequest request) {
        Cashier cashier = getCashierEntityById(publicId);

        if (request.getAssignedUserIds() != null) {
            Set<User> users = new HashSet<>();
            for (String userId : request.getAssignedUserIds()) {
                User user = userRepository.findByPublicId(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", userId));
                users.add(user);
            }
            cashier.setAssignedUsers(users);
        }

        cashierMapper.updateEntityFromRequest(request, cashier);
        Cashier updatedCashier = cashierRepository.save(cashier);
        return cashierMapper.toResponse(updatedCashier);
    }

    @Transactional
    public CashierResponse changePin(String publicId, CashierChangePinRequest request) {
        Cashier cashier = getCashierEntityById(publicId);

        validatePin(request.getNewPin());

        cashier.setPin(passwordEncoder.encode(request.getNewPin()));
        cashier.setFailedPinAttempts(0);
        cashier.setLockedUntil(null);

        Cashier updatedCashier = cashierRepository.save(cashier);
        return cashierMapper.toResponse(updatedCashier);
    }

    public boolean validatePin(String plainPin, String publicId) {
        Cashier cashier = getCashierEntityById(publicId);

        if (cashier.getStatus() == CashierStatus.LOCKED) {
            if (cashier.getLockedUntil() != null && LocalDateTime.now().isBefore(cashier.getLockedUntil())) {
                throw new ConflictException(
                        "cashier",
                        publicId,
                        "Cashier is locked. Try again later."
                );
            } else {
                cashier.setStatus(CashierStatus.ACTIVE);
                cashier.setFailedPinAttempts(0);
                cashier.setLockedUntil(null);
                cashierRepository.save(cashier);
            }
        }

        if (passwordEncoder.matches(plainPin, cashier.getPin())) {
            cashier.setFailedPinAttempts(0);
            cashierRepository.save(cashier);
            return true;
        } else {
            cashier.setFailedPinAttempts(cashier.getFailedPinAttempts() + 1);

            if (cashier.getFailedPinAttempts() >= 3) {
                cashier.setStatus(CashierStatus.LOCKED);
                cashier.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            }

            cashierRepository.save(cashier);
            return false;
        }
    }

    public Cashier getCashierEntityById(String publicId) {
        return cashierRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier", "publicId", publicId));
    }

    @Transactional
    public void deactivateCashier(String publicId) {
        Cashier cashier = getCashierEntityById(publicId);
        cashier.setStatus(CashierStatus.INACTIVE);
        cashierRepository.save(cashier);
    }

    @Transactional
    public void unlockCashier(String publicId) {
        Cashier cashier = getCashierEntityById(publicId);
        cashier.setStatus(CashierStatus.ACTIVE);
        cashier.setFailedPinAttempts(0);
        cashier.setLockedUntil(null);
        cashierRepository.save(cashier);
    }

    private void validatePin(String pin) {
        if (!pin.matches("^[0-9]{4}$")) {
            throw new IllegalArgumentException("PIN must be exactly 4 digits");
        }
    }
}
