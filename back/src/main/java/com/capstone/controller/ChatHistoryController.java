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
            
            // Get the next available ID
            Long nextId = chatHistoryService.getNextId();
            
            ChatHistory chatHistory = ChatHistory.builder()
                .id(nextId)
                .user(user)
                .message(chatHistoryDTO.getMessage())
                .response(chatHistoryDTO.getResponse())
                .insight(chatHistoryDTO.getInsight())
                .cognitiveDistortion(chatHistoryDTO.getCognitiveDistortion())
                .severity(chatHistoryDTO.getSeverity())
                .sessionId(
                    chatHistoryDTO.getSessionId() != null && !chatHistoryDTO.getSessionId().isEmpty()
                        ? chatHistoryDTO.getSessionId()
                        : UUID.randomUUID().toString()
                )
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
                .sessionId(savedChatHistory.getSessionId())
                .build();
                
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAllChatHistories(@RequestParam(value = "sessionId", required = false) String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            List<ChatHistory> chatHistories;
            if (sessionId != null && !sessionId.isEmpty()) {
                chatHistories = chatHistoryService.findByUserIdAndSessionId(user.getId(), sessionId);
            } else {
                chatHistories = chatHistoryService.findByUserId(user.getId());
            }
            List<ChatHistoryDTO> responseDTOs = chatHistories.stream()
                .map(history -> ChatHistoryDTO.builder()
                    .userId(history.getUser().getId().toString())
                    .message(history.getMessage())
                    .response(history.getResponse())
                    .insight(history.getInsight())
                    .cognitiveDistortion(history.getCognitiveDistortion())
                    .severity(history.getSeverity())
                    .timestamp(history.getTimestamp())
                    .sessionId(history.getSessionId())
                    .build())
                .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            chatHistoryService.deleteSession(user.getId(), sessionId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 