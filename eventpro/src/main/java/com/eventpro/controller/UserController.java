package com.eventpro.controller;

import com.eventpro.dto.response.UserResponseDTO;
import com.eventpro.entity.AppUser;
import com.eventpro.exception.ResourceNotFoundException;
import com.eventpro.mapper.UserMapper;
import com.eventpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Mirrors dataService.getUserProfile from the original frontend, scoped to
 * the currently authenticated user via the JWT.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserDetails currentUser) {
        AppUser user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(userMapper.toResponseDto(user));
    }
}

