package com.eventpro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mirrors the nested "stats" object in src/types.ts User interface.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsDTO {
    private Integer registered;
    private Integer upcoming;
    private Integer completed;
}
