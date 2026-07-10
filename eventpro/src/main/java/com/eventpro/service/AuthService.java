package com.eventpro.service;

import com.eventpro.dto.request.LoginRequestDTO;
import com.eventpro.dto.request.SignupRequestDTO;
import com.eventpro.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO signup(SignupRequestDTO requestDto);

    AuthResponseDTO login(LoginRequestDTO requestDto);
}