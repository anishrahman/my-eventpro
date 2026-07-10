package com.eventpro.entity;

/**
 * Mirrors the EventStatus enum from the original frontend (src/types.ts).
 * ALL is intentionally omitted here — it was a UI filter option, not a real persisted state.
 */
public enum EventStatus {
    LIVE,
    UPCOMING,
    PAST,
    CONFIRMED,
    PENDING
}
