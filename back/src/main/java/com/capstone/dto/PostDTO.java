package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createdAt;
    private String username;
    private List<String> tags;
    private Long userId;
} 