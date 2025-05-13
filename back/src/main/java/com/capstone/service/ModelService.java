package com.capstone.service;

import com.capstone.dto.ModelRequestDTO;
import com.capstone.dto.ModelResponseDTO;
import com.capstone.dto.ChatHistoryDTO;
import com.capstone.entity.ChatHistory;
import com.capstone.entity.User;
import com.capstone.repository.ChatHistoryRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class ModelService {
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;

    public ChatHistory saveChatHistory(String userId, String message, String response) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        ChatHistory chatHistory = ChatHistory.builder()
                .user(user)
                .message(message)
                .response(response)
                .timestamp(LocalDateTime.now())
                .build();

        return chatHistoryRepository.save(chatHistory);
    }

    public List<ChatHistory> getChatHistory(String userId) {
        return chatHistoryRepository.findByUser_IdOrderByTimestampDesc(Long.parseLong(userId));
    }

    public ModelResponseDTO processChat(ModelRequestDTO request) {
        // TODO: 실제 모델 처리 로직 구현
        return ModelResponseDTO.builder()
                .response("Sample response")
                .insight("Sample insight")
                .cognitiveDistortion("Sample distortion")
                .severity(1)
                .build();
    }

    public void saveChatHistory(ChatHistoryDTO chatHistoryDTO) {
        User user = userRepository.findById(Long.parseLong(chatHistoryDTO.getUserId()))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        ChatHistory chatHistory = ChatHistory.builder()
                .user(user)
                .message(chatHistoryDTO.getMessage())
                .response(chatHistoryDTO.getResponse())
                .timestamp(LocalDateTime.now())
                .insight(chatHistoryDTO.getInsight())
                .cognitiveDistortion(chatHistoryDTO.getCognitiveDistortion())
                .severity(chatHistoryDTO.getSeverity())
                .build();

        chatHistoryRepository.save(chatHistory);
    }

    public List<ChatHistoryDTO> loadChatHistory(String userId) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return chatHistoryRepository.findByUser_IdOrderByTimestampDesc(user.getId()).stream()
                .map(history -> ChatHistoryDTO.builder()
                        .userId(history.getUser().getId().toString())
                        .message(history.getMessage())
                        .response(history.getResponse())
                        .timestamp(history.getTimestamp())
                        .insight(history.getInsight())
                        .cognitiveDistortion(history.getCognitiveDistortion())
                        .severity(history.getSeverity())
                        .build())
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUserChatDataForModeling(String userId) {
        List<ChatHistory> chatHistories = chatHistoryRepository.findByUser_IdOrderByTimestampDesc(Long.parseLong(userId));
        
        return chatHistories.stream()
                .map(history -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", history.getId());
                    data.put("user_id", history.getUser().getId());
                    data.put("message", history.getMessage());
                    data.put("response", history.getResponse());
                    data.put("timestamp", history.getTimestamp());
                    data.put("cognitive_distortion", history.getCognitiveDistortion());
                    data.put("insight", history.getInsight());
                    data.put("session_id", history.getSessionId());
                    data.put("severity", history.getSeverity());
                    return data;
                })
                .collect(Collectors.toList());
    }
} 