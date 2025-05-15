package com.capstone.dto;

import com.capstone.entity.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDTO {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;

    public CommentResponseDTO(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.userId = comment.getUser() != null ? comment.getUser().getId() : null;
    }
}