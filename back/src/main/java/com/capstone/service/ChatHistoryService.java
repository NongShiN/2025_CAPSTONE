package com.capstone.service;

import com.capstone.entity.ChatHistory;
import com.capstone.repository.ChatHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;




@Service
public class ChatHistoryService {

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    public Long getNextId() {
        try {
            ChatHistory lastChat = chatHistoryRepository.findTopByOrderByIdDesc();
            if (lastChat == null) {
                // 테이블이 비어있을 때는 1을 반환
                return 1L;
            }
            return lastChat.getId() + 1;
        } catch (Exception e) {
            // 에러 발생 시에도 1을 반환
            return 1L;
        }
    }

    public ChatHistory saveChatHistory(ChatHistory chatHistory) {
        return chatHistoryRepository.save(chatHistory);
    }

    public List<ChatHistory> getAllChatHistories() {
        return chatHistoryRepository.findAll();
    }

    public List<ChatHistory> findByUserId(Long userId) {
        return chatHistoryRepository.findByUser_IdOrderByTimestampDesc(userId);
    }

    public List<ChatHistory> findByUserIdAndSessionId(Long userId, String sessionId) {
        return chatHistoryRepository.findByUser_IdAndSessionIdOrderByTimestampDesc(userId, sessionId);
    }

    public void deleteSession(Long userId, String sessionId) {
        List<ChatHistory> chatHistories = findByUserIdAndSessionId(userId, sessionId);
        if (chatHistories.isEmpty()) {
            throw new RuntimeException("해당 세션을 찾을 수 없습니다.");
        }
        
        // 세션의 모든 채팅 내역 삭제
        chatHistoryRepository.deleteAll(chatHistories);
    }
} 