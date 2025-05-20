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
                .cbtBasicInsight("Sample CBT basic insight")
                .cbtCdInsight("Sample CBT CD insight")
                .iptLog("Sample IPT log")
                .build();
    }

    public void saveChatHistory(ChatHistoryDTO chatHistoryDTO) {
        User user = userRepository.findById(Long.parseLong(chatHistoryDTO.getUserId()))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        ChatHistory chatHistory = ChatHistory.builder()
                .user(user)
                .message(chatHistoryDTO.getMessage())
                .response(chatHistoryDTO.getResponse())
                .sessionId(chatHistoryDTO.getSessionId())
                .sessionInsight(chatHistoryDTO.getSessionInsight())
                .selectedSupervisor(chatHistoryDTO.getSelectedSupervisor())
                .pfRating(chatHistoryDTO.getPfRating())
                .iptLog(chatHistoryDTO.getIptLog())
                .cbtBasicInsight(chatHistoryDTO.getCbtBasicInsight())
                .cbtCdInsight(chatHistoryDTO.getCbtCdInsight())
                .cbtLog(chatHistoryDTO.getCbtLog())
                .title(chatHistoryDTO.getTitle())
                .timestamp(LocalDateTime.now())
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
                        .sessionId(history.getSessionId())
                        .sessionInsight(history.getSessionInsight())
                        .selectedSupervisor(history.getSelectedSupervisor())
                        .pfRating(history.getPfRating())
                        .iptLog(history.getIptLog())
                        .cbtBasicInsight(history.getCbtBasicInsight())
                        .cbtCdInsight(history.getCbtCdInsight())
                        .cbtLog(history.getCbtLog())
                        .title(history.getTitle())
                        .timestamp(history.getTimestamp())
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
                    data.put("session_id", history.getSessionId());
                    data.put("session_insight", history.getSessionInsight());
                    data.put("selected_supervisor", history.getSelectedSupervisor());
                    data.put("pf_rating", history.getPfRating());
                    data.put("ipt_log", history.getIptLog());
                    data.put("cbt_basic_insight", history.getCbtBasicInsight());
                    data.put("cbt_cd_insight", history.getCbtCdInsight());
                    data.put("cbt_log", history.getCbtLog());
                    data.put("title", history.getTitle());
                    return data;
                })
                .collect(Collectors.toList());
    }
} 