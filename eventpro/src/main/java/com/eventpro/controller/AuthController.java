package com.eventpro.controller;

import com.eventpro.dto.request.LoginRequestDTO;
import com.eventpro.dto.request.SignupRequestDTO;
import com.eventpro.dto.response.AuthResponseDTO;
import com.eventpro.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signup(@Valid @RequestBody SignupRequestDTO requestDto) {
        AuthResponseDTO response = authService.signup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDto) {
        AuthResponseDTO response = authService.login(requestDto);
        return ResponseEntity.ok(response);
    }
}





