package com.eventpro.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Inbound payload for creating/updating an Event.
 * Mirrors the formData shape in src/screens/CreateEvent.tsx, with validation
 * rules enforced server-side via @Valid in the controller.
 */
@Data
public class EventRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Location is required")
    private String location;

    private String venueAddress;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate date;

    private LocalTime time;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 1_000_000, message = "Capacity is unrealistically large")
    private Integer capacity;

    private String imageUrl;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private Boolean isFeatured;

    @PositiveOrZero(message = "Price cannot be negative")
    private Double price;

    @Email(message = "Contact email must be a valid email address")
    private String contactEmail;

    @Pattern(regexp = "^$|^[+0-9 ()-]{7,20}$", message = "Contact phone number is invalid")
    private String contactPhone;
}

