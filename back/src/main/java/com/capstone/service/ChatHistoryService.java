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

    public ChatHistory saveChatHistory(ChatHistory chatHistory) {
        return chatHistoryRepository.save(chatHistory);
    }

    public List<ChatHistory> getAllChatHistories() {
        return chatHistoryRepository.findAll();
    }

    public List<ChatHistory> findByUserId(Long userId) {
        return chatHistoryRepository.findByUser_IdOrderByTimestampDesc(userId);
    }
} 