package com.eventpro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mirrors src/types.ts AdminStats interface, used by the admin dashboard
 * KPI cards (src/screens/AdminDashboard.tsx).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponseDTO {
    private Long totalEvents;
    private Long totalRegistrations;
    private Double totalRevenue;
    private Double averageCapacityUtilization;
}

