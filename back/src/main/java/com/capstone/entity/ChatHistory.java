package com.capstone.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "response", columnDefinition = "TEXT")
    private String response;

    @Column(name = "insight", columnDefinition = "TEXT")
    private String insight;

    @Column(name = "cognitive_distortion")
    private String cognitiveDistortion;

    @Column(name = "severity")
    private Integer severity;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "title")
    private String title;

    @Column(name = "session_insight", columnDefinition = "TEXT")
    private String sessionInsight;

    @Column(name = "selected_supervisor")
    private String selectedSupervisor;

    @Column(name = "pf_rating")
    private String pfRating;

    @Column(name = "ipt_log", columnDefinition = "TEXT")
    private String iptLog;

    @Column(name = "cbt_basic_insight", columnDefinition = "TEXT")
    private String cbtBasicInsight;

    @Column(name = "cbt_cd_insight", columnDefinition = "TEXT")
    private String cbtCdInsight;

    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
} 