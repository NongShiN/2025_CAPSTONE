package com.capstone.controller;

import com.capstone.dto.UserDTO;
import com.capstone.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // 클래스 레벨 기본 경로
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // "/api/auth" 제거하고 "/signup"만 남김
    @PostMapping("/signup")
    public ResponseEntity<UserDTO> signup(@RequestBody UserDTO userDTO) {
        // 이제 이 메서드의 최종 경로는 /api/auth/signup 이 됩니다.
        return ResponseEntity.ok(authService.signup(userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody UserDTO userDTO) {
        // 이 메서드의 최종 경로는 /api/auth/login 입니다.
        return ResponseEntity.ok(authService.login(userDTO));
    }
}