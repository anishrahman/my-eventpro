package com.eventpro.service.impl;

import com.eventpro.dto.request.LoginRequestDTO;
import com.eventpro.dto.request.SignupRequestDTO;
import com.eventpro.dto.response.AuthResponseDTO;
import com.eventpro.entity.AppUser;
import com.eventpro.entity.Role;
import com.eventpro.exception.DuplicateEmailException;
import com.eventpro.mapper.UserMapper;
import com.eventpro.repository.UserRepository;
import com.eventpro.security.JwtUtil;
import com.eventpro.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mirrors src/services/authService.ts (signup/login), but backed by our own
 * user table + JWTs instead of Firebase Auth.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponseDTO signup(SignupRequestDTO requestDto) {
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new DuplicateEmailException("An account with this email already exists");
        }

        AppUser user = AppUser.builder()
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role(Role.ATTENDEE)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + requestDto.getEmail())
                .registeredCount(0)
                .upcomingCount(0)
                .completedCount(0)
                .build();

        AppUser saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toResponseDto(saved))
                .build();
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO requestDto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        AppUser user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toResponseDto(user))
                .build();
    }
}
