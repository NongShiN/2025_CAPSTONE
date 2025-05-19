package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelResponseDTO {
    private String response;
    private String cbtBasicInsight;
    private String cbtCdInsight;
    private String iptLog;
} 