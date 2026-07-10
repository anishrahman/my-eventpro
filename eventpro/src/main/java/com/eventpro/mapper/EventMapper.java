package com.eventpro.mapper;

import com.eventpro.dto.request.EventRequestDTO;
import com.eventpro.dto.response.EventResponseDTO;
import com.eventpro.entity.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registered", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "featured", source = "isFeatured")
    Event toEntity(EventRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registered", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "featured", source = "isFeatured")
    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(EventRequestDTO dto, @MappingTarget Event entity);

    @Mapping(target = "organizerId", source = "organizer.id")
    @Mapping(target = "isFeatured", source = "featured")
    EventResponseDTO toResponseDto(Event entity);

    List<EventResponseDTO> toResponseDtoList(List<Event> entities);
}