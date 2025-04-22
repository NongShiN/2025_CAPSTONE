package com.capstone.service;

import com.capstone.dto.ModelRequestDTO;
import com.capstone.dto.ModelResponseDTO;
import com.capstone.dto.ChatHistoryDTO;
import com.capstone.entity.ChatHistory;
import com.capstone.repository.ChatHistoryRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ChatHistoryRepository chatHistoryRepository;

    public ModelResponseDTO processChat(ModelRequestDTO request) {
        try {
            // Python 스크립트 실행
            ProcessBuilder processBuilder = new ProcessBuilder(
                "python3",
                "model/chat.py",
                request.getMessage(),
                request.getUserId()
            );
            
            Process process = processBuilder.start();
            
            // 결과 읽기
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            List<String> output = new ArrayList<>();
            
            while ((line = reader.readLine()) != null) {
                output.add(line);
            }
            
            // 응답 생성
            ModelResponseDTO response = new ModelResponseDTO();
            if (output.size() >= 4) {
                response.setResponse(output.get(0));
                response.setInsight(output.get(1));
                response.setCognitiveDistortion(output.get(2));
                response.setSeverity(Integer.parseInt(output.get(3)));
            }
            
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Error processing chat request", e);
        }
    }

    public void saveChatHistory(ChatHistoryDTO chatHistoryDTO) {
        ChatHistory chatHistory = new ChatHistory();
        chatHistory.setUserId(chatHistoryDTO.getUserId());
        chatHistory.setMessage(chatHistoryDTO.getMessage());
        chatHistory.setResponse(chatHistoryDTO.getResponse());
        chatHistory.setTimestamp(LocalDateTime.now());
        
        chatHistoryRepository.save(chatHistory);
    }

    public List<ChatHistoryDTO> loadChatHistory(String userId) {
        List<ChatHistory> histories = chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
        return histories.stream()
            .map(history -> {
                ChatHistoryDTO dto = new ChatHistoryDTO();
                dto.setUserId(history.getUserId());
                dto.setMessage(history.getMessage());
                dto.setResponse(history.getResponse());
                dto.setTimestamp(history.getTimestamp());
                return dto;
            })
            .toList();
    }
} 