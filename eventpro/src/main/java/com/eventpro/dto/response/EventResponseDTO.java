package com.eventpro.dto.response;

import com.eventpro.entity.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Outbound shape for an Event. Mirrors src/types.ts Event interface so the
 * existing React frontend can consume it with minimal changes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponseDTO {
    private Long id;
    private String title;
    private String location;
    private String venueAddress;
    private LocalDate date;
    private LocalTime time;
    private Integer registered;
    private Integer capacity;
    private String imageUrl;
    private EventStatus status;
    private String category;
    private String description;
    private Boolean isFeatured;
    private Double price;
    private String contactEmail;
    private String contactPhone;
    private Long organizerId;
}
