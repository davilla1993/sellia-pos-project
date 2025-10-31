package com.follysitou.sellia_backend.util;

import com.follysitou.sellia_backend.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserPrincipal) {
                return ((UserPrincipal) principal).getUsername();
            } else if (principal instanceof String) {
                return (String) principal;
            }
        }

        return "SYSTEM";
    }

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserPrincipal) {
                return ((UserPrincipal) principal).getUserId();
            }
        }

        return null;
    }
}
