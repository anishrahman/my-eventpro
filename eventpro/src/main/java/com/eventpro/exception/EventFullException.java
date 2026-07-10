package com.eventpro.exception;

/**
 * Mirrors the "Event is at full capacity" error thrown in the original
 * dataService.registerForEvent (src/services/dataService.ts).
 */
public class EventFullException extends RuntimeException {
    public EventFullException(String message) {
        super(message);
    }
}

