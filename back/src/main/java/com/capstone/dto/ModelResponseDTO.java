package com.capstone.dto;

import lombok.Data;

@Data
public class ModelResponseDTO {
    private String response;
    private String insight;
    private String cognitiveDistortion;
    private Integer severity;
} 