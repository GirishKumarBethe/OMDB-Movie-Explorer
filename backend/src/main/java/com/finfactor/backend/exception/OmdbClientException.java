package com.finfactor.backend.exception;

public class OmdbClientException extends RuntimeException {
    public OmdbClientException(String message) {
        super(message);
    }
}
