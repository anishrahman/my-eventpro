package com.eventpro.controller;

import com.eventpro.dto.response.AdminStatsResponseDTO;
import com.eventpro.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Mirrors the KPI cards in src/screens/AdminDashboard.tsx.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsResponseDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}

