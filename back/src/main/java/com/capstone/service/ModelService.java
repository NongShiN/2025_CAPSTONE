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
} 