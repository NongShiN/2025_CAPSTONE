package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryDTO {
    private String userId;
    private String message;
    private String response;
    private LocalDateTime timestamp;
    private String sessionId;
    private String title;
    private String sessionInsight;
    private String selectedSupervisor;
    private String pfRating;
    private String iptLog;
    private String cbtBasicInsight;
    private String cbtCdInsight;
    private String cbtLog;
}
