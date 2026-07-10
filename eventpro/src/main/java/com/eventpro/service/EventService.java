package com.eventpro.service;

import com.eventpro.dto.request.EventRequestDTO;
import com.eventpro.dto.response.EventResponseDTO;

import java.util.List;

public interface EventService {

    List<EventResponseDTO> getAllEvents();

    EventResponseDTO getEventById(Long id);

    EventResponseDTO createEvent(EventRequestDTO requestDto, String organizerEmail);

    EventResponseDTO updateEvent(Long id, EventRequestDTO requestDto);

    void deleteEvent(Long id);

    EventResponseDTO registerForEvent(Long eventId);
}
