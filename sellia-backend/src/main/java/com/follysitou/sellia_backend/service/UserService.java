package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.UserRegistrationRequest;
import com.follysitou.sellia_backend.dto.request.UserUpdateRequest;
import com.follysitou.sellia_backend.dto.response.UserResponse;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.UserMapper;
import com.follysitou.sellia_backend.model.Role;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.UserRepository;
import com.follysitou.sellia_backend.util.PasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserRegistrationRequest request) {
        if (userRepository.existsByUsernameAndDeletedFalse(request.getUsername())) {
            throw new ConflictException("username", request.getUsername(), "Username already exists");
        }

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("email", request.getEmail(), "Email already exists");
        }

        PasswordValidator.validate(request.getPassword());

        Role role = roleService.getRoleById(request.getRoleId());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    public UserResponse getUserById(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));
        return userMapper.toResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return userMapper.toResponse(user);
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findByDeletedFalse(pageable);
        return users.map(userMapper::toResponse);
    }

    @Transactional
    public UserResponse updateUser(String publicId, UserUpdateRequest request) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getRoleId() != null) {
            Role role = roleService.getRoleById(request.getRoleId());
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public void changePassword(String publicId, String currentPassword, String newPassword, String confirmPassword) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new com.follysitou.sellia_backend.exception.ValidationException("Current password is incorrect");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new com.follysitou.sellia_backend.exception.ValidationException("New password and confirmation do not match");
        }

        PasswordValidator.validate(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String publicId, String newPassword, String confirmPassword) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));

        if (!newPassword.equals(confirmPassword)) {
            throw new com.follysitou.sellia_backend.exception.ValidationException("New password and confirmation do not match");
        }

        PasswordValidator.validate(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void markFirstLoginComplete(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", publicId));
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
