package com.finfactor.backend.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SimpleCache<T> {


    private static class Entry<T> {
        final T value;
        final long expiresAt;

        Entry(T value, long expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, Entry<T>> store = new ConcurrentHashMap<>();
    private final long ttlMillis;

    public SimpleCache(long ttlMillis) {
        this.ttlMillis = ttlMillis;
    }

    public T get(String key) {
        Entry<T> entry = store.get(key);
        long now = System.currentTimeMillis();
        if (entry == null || entry.expiresAt < now) {
            if (entry != null) {
                store.remove(key);
            }
            return null;
        }
        return entry.value;
    }

    public void put(String key, T value) {
        long expiresAt = System.currentTimeMillis() + ttlMillis;
        store.put(key, new Entry<>(value, expiresAt));
    }
}
