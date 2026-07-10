package com.eventpro.mapper;

import com.eventpro.dto.response.UserResponseDTO;
import com.eventpro.dto.response.UserStatsDTO;
import com.eventpro.entity.AppUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "stats", expression = "java(toStatsDto(user))")
    UserResponseDTO toResponseDto(AppUser user);

    default UserStatsDTO toStatsDto(AppUser user) {
        return UserStatsDTO.builder()
                .registered(user.getRegisteredCount())
                .upcoming(user.getUpcomingCount())
                .completed(user.getCompletedCount())
                .build();
    }
}