package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.LoginRequest;
import com.follysitou.sellia_backend.dto.response.AuthResponse;
import com.follysitou.sellia_backend.exception.UnauthorizedException;
import com.follysitou.sellia_backend.mapper.UserMapper;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.UserRepository;
import com.follysitou.sellia_backend.security.JwtTokenProvider;
import com.follysitou.sellia_backend.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException(ErrorMessages.CREDENTIALS_INVALID));

        if (!user.getActive()) {
            throw new UnauthorizedException(ErrorMessages.ACCOUNT_DISABLED);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(ErrorMessages.CREDENTIALS_INVALID);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getUsername(), user.getPublicId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername(), user.getPublicId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .build();
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED);
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException(ErrorMessages.USER_NOT_FOUND));

        if (!user.getActive()) {
            throw new UnauthorizedException(ErrorMessages.ACCOUNT_DISABLED);
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(username, userId);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .build();
    }
}
