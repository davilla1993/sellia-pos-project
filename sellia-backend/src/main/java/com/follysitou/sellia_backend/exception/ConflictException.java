package com.follysitou.sellia_backend.exception;

public class ConflictException extends RuntimeException {

    private final String field;
    private final Object value;

    public ConflictException(String message) {
        super(message);
        this.field = null;
        this.value = null;
    }

    public ConflictException(String field, Object value, String message) {
        super(message);
        this.field = field;
        this.value = value;
    }

    public String getField() {
        return field;
    }

    public Object getValue() {
        return value;
    }
}
