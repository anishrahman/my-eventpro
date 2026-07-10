package com.eventpro.service.impl;

import com.eventpro.dto.request.EventRequestDTO;
import com.eventpro.dto.response.EventResponseDTO;
import com.eventpro.entity.AppUser;
import com.eventpro.entity.Event;
import com.eventpro.entity.EventStatus;
import com.eventpro.exception.EventFullException;
import com.eventpro.exception.ResourceNotFoundException;
import com.eventpro.mapper.EventMapper;
import com.eventpro.repository.EventRepository;
import com.eventpro.repository.UserRepository;
import com.eventpro.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;

    @Override
    public List<EventResponseDTO> getAllEvents() {
        return eventMapper.toResponseDtoList(eventRepository.findAllByOrderByDateDesc());
    }

    @Override
    public EventResponseDTO getEventById(Long id) {
        Event event = findEventOrThrow(id);
        return eventMapper.toResponseDto(event);
    }

    @Override
    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO requestDto, String organizerEmail) {
        AppUser organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found: " + organizerEmail));

        Event event = eventMapper.toEntity(requestDto);
        event.setRegistered(0);
        event.setStatus(EventStatus.UPCOMING);
        event.setOrganizer(organizer);

        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public EventResponseDTO updateEvent(Long id, EventRequestDTO requestDto) {
        Event event = findEventOrThrow(id);
        eventMapper.updateEntityFromDto(requestDto, event);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = findEventOrThrow(id);
        eventRepository.delete(event);
    }

    @Override
    @Transactional
    public EventResponseDTO registerForEvent(Long eventId) {
        Event event = findEventOrThrow(eventId);

        if (event.getRegistered() >= event.getCapacity()) {
            throw new EventFullException("Event is at full capacity");
        }

        event.setRegistered(event.getRegistered() + 1);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }
}

