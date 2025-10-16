package com.follysitou.sellia_backend.util;

import com.follysitou.sellia_backend.exception.ValidationException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class PasswordValidator {

    private static final int MIN_LENGTH = 6;
    private static final String UPPERCASE_REGEX = ".*[A-Z].*";
    private static final String DIGIT_REGEX = ".*\\d.*";
    private static final String SPECIAL_CHAR_REGEX = ".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*";

    public static void validate(String password) {
        Map<String, String> errors = new HashMap<>();

        if (password == null || password.isEmpty()) {
            errors.put("password", "Password is required");
        } else {
            if (password.length() < MIN_LENGTH) {
                errors.put("password", "Password must be at least 6 characters");
            }
            if (!Pattern.matches(UPPERCASE_REGEX, password)) {
                errors.put("password", "Password must contain at least one uppercase letter");
            }
            if (!Pattern.matches(DIGIT_REGEX, password)) {
                errors.put("password", "Password must contain at least one digit");
            }
            if (!Pattern.matches(SPECIAL_CHAR_REGEX, password)) {
                errors.put("password", "Password must contain at least one special character");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Password does not meet security requirements", errors);
        }
    }
}
