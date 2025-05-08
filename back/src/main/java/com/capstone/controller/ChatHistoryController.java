package com.capstone.controller;

import com.capstone.service.ChatHistoryService;
import com.capstone.entity.ChatHistory;
import com.capstone.entity.User;
import com.capstone.service.UserService;
import com.capstone.dto.ChatHistoryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Autowired
    private ChatHistoryService chatHistoryService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> saveChatHistory(@RequestBody ChatHistoryDTO chatHistoryDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            ChatHistory chatHistory = ChatHistory.builder()
                .user(user)
                .message(chatHistoryDTO.getMessage())
                .response(chatHistoryDTO.getResponse())
                .insight(chatHistoryDTO.getInsight())
                .cognitiveDistortion(chatHistoryDTO.getCognitiveDistortion())
                .severity(chatHistoryDTO.getSeverity())
                .sessionId(UUID.randomUUID().toString())
                .build();
            
            ChatHistory savedChatHistory = chatHistoryService.saveChatHistory(chatHistory);
            
            ChatHistoryDTO responseDTO = ChatHistoryDTO.builder()
                .userId(savedChatHistory.getUser().getId().toString())
                .message(savedChatHistory.getMessage())
                .response(savedChatHistory.getResponse())
                .insight(savedChatHistory.getInsight())
                .cognitiveDistortion(savedChatHistory.getCognitiveDistortion())
                .severity(savedChatHistory.getSeverity())
                .timestamp(savedChatHistory.getTimestamp())
                .build();
                
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAllChatHistories() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            List<ChatHistory> chatHistories = chatHistoryService.findByUserId(user.getId());
            List<ChatHistoryDTO> responseDTOs = chatHistories.stream()
                .map(history -> ChatHistoryDTO.builder()
                    .userId(history.getUser().getId().toString())
                    .message(history.getMessage())
                    .response(history.getResponse())
                    .insight(history.getInsight())
                    .cognitiveDistortion(history.getCognitiveDistortion())
                    .severity(history.getSeverity())
                    .timestamp(history.getTimestamp())
                    .build())
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(responseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 