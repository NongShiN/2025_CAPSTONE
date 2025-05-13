package com.capstone.repository;

import com.capstone.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUser_IdOrderByTimestampDesc(Long userId);
    ChatHistory findTopByOrderByIdDesc();
    List<ChatHistory> findByUser_IdAndSessionIdOrderByTimestampDesc(Long userId, String sessionId);
} 