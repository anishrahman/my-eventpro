package com.eventpro.dto.response;

import com.eventpro.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Outbound shape for a user profile. Deliberately excludes the password hash
 * — this is the main reason the DTO pattern exists instead of returning the
 * entity directly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String avatar;
    private UserStatsDTO stats;
}