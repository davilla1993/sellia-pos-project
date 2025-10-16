package com.follysitou.sellia_backend.security;

import com.follysitou.sellia_backend.exception.UnauthorizedException;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is disabled");
        }

        return UserPrincipal.build(user);
    }

    public UserPrincipal loadUserPrincipalByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found with username: " + username));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is disabled");
        }

        return UserPrincipal.build(user);
    }

    public UserPrincipal loadUserById(String userId) {
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found with id: " + userId));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is disabled");
        }

        return UserPrincipal.build(user);
    }
}
