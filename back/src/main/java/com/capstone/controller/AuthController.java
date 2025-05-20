package com.capstone.controller;

import com.capstone.dto.UserDTO;
import com.capstone.entity.User;
import com.capstone.service.AuthService;
import com.capstone.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserDTO userDTO) {
        try {
            UserDTO response = authService.signup(userDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("duplicate key value")) {
                errorMessage = "이미 존재하는 이메일입니다.";
            }
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        try {
            UserDTO response = authService.login(userDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("User not found")) {
                    errorMessage = "존재하지 않는 이메일입니다.";
                } else if (errorMessage.contains("Invalid password")) {
                    errorMessage = "비밀번호가 올바르지 않습니다.";
                }
            }
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
    }

    // 게스트 사용자 생성
    @PostMapping("/guest")
    public ResponseEntity<?> createGuestUser() {
        try {
            User user = userService.createGuestUser();
            String token = authService.generateToken(user);
            UserDTO response = UserDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .token(token)
                    .build();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 사용자 정보 조회
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 현재 로그인된 사용자 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.getUserFromToken(token);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 사용자 인사이트 업데이트
    @PutMapping("/user/{id}/insight")
    public ResponseEntity<?> updateUserInsight(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String userInsight = request.get("userInsight");
            if (userInsight == null) {
                return ResponseEntity.badRequest().body("userInsight가 필요합니다.");
            }

            User user = userService.findById(id);
            user.setUserInsight(userInsight);
            userService.saveUser(user);

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
