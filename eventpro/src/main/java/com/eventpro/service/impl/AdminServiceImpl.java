package com.eventpro.service.impl;

import com.eventpro.dto.response.AdminStatsResponseDTO;
import com.eventpro.entity.Event;
import com.eventpro.repository.EventRepository;
import com.eventpro.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final EventRepository eventRepository;

    @Override
    public AdminStatsResponseDTO getStats() {
        List<Event> events = eventRepository.findAll();

        long totalEvents = events.size();

        long totalRegistrations = events.stream()
                .mapToLong(Event::getRegistered)
                .sum();

        double totalRevenue = events.stream()
                .mapToDouble(e -> (e.getPrice() == null ? 0 : e.getPrice()) * e.getRegistered())
                .sum();

        long totalCapacity = events.stream()
                .mapToLong(Event::getCapacity)
                .sum();

        double utilization = totalCapacity == 0
                ? 0.0
                : (totalRegistrations * 100.0) / totalCapacity;

        return AdminStatsResponseDTO.builder()
                .totalEvents(totalEvents)
                .totalRegistrations(totalRegistrations)
                .totalRevenue(totalRevenue)
                .averageCapacityUtilization(Math.round(utilization * 10) / 10.0)
                .build();
    }
}
