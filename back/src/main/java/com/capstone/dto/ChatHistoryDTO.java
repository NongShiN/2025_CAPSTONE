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
    private String insight;
    private String cognitiveDistortion;
    private Integer severity;
    private String sessionId;
    private String title;
}
