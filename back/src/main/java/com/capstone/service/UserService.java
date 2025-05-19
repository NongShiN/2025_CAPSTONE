package com.capstone.service;

import com.capstone.entity.AuthProvider;
import com.capstone.entity.User;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(String email, String password, String username) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .username(username)
                .isGuest(false)
                .build();

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User createGuestUser() {
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        String guestEmail = guestUsername + "@guest.com";
        String guestPassword = UUID.randomUUID().toString();

        User guestUser = User.builder()
                .email(guestEmail)
                .password(guestPassword)
                .username(guestUsername)
                .build();

        return userRepository.save(guestUser);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
} 