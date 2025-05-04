package com.capstone.controller;

import com.capstone.dto.ModelRequestDTO;
import com.capstone.dto.ModelResponseDTO;
import com.capstone.dto.ChatHistoryDTO;
import com.capstone.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/model")
@RequiredArgsConstructor
public class ModelController {

    private final ModelService modelService;

    @PostMapping("/chat")
    public ResponseEntity<ModelResponseDTO> chat(@RequestBody ModelRequestDTO request) {
        return ResponseEntity.ok(modelService.processChat(request));
    }

    @PostMapping("/save-chat")
    public ResponseEntity<Void> saveChat(@RequestBody ChatHistoryDTO request) {
        modelService.saveChatHistory(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/load-chat/{userId}")
    public ResponseEntity<List<ChatHistoryDTO>> loadChat(@PathVariable String userId) {
        return ResponseEntity.ok(modelService.loadChatHistory(userId));
    }
} 