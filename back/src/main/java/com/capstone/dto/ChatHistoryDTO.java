package com.capstone.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatHistoryDTO {
    private String userId;
    private String message;
    private String response;
    private LocalDateTime timestamp;
} 