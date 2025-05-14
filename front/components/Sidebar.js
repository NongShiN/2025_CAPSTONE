import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import styles from "../styles/Sidebar.module.css";
import URLS from '../config';

export default function Sidebar({ isGuest = false, onNewChat, onSelectChat, newChatTrigger, refreshSessionList, theme }) {
    const router = useRouter();
    const [chatSessions, setChatSessions] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const loadSessions = useCallback(async () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && !storedUser.guest) {
            try {
                const res = await fetch(`${URLS.BACK}/api/chat/history`, {
                    headers: {
                        "Authorization": `Bearer ${storedUser.token}`
                    }
                });
                const data = await res.json();
                
                const sessionsMap = {};
                data.forEach(history => {
                    const sid = history.sessionId || history.session_id;
                    if (!sid) {
                        console.error("sessionId가 없는 history:", history);
                        return;
                    }
                    
                    if (!sessionsMap[sid]) {
                        sessionsMap[sid] = {
                            id: sid,
                            sessionId: sid,
                            title: history.title || history.message?.slice(0, 30) || "New Chat",
                            createdAt: new Date(history.timestamp),
                            messages: []
                        };
                    }
                    
                    const messageId = `msg_${history.id}_${Date.now()}`;
                    const responseId = `resp_${history.id}_${Date.now()}`;
                    
                    sessionsMap[sid].messages.push({
                        id: messageId,
                        sender: "user",
                        text: history.message,
                        sessionId: sid,
                        timestamp: history.timestamp
                    });
                    
                    if (history.response) {
                        sessionsMap[sid].messages.push({
                            id: responseId,
                            sender: "bot",
                            text: history.response,
                            sessionId: sid,
                            timestamp: history.timestamp
                        });
                    }
                });
                
                Object.values(sessionsMap).forEach(session => {
                    session.messages.sort((a, b) => 
                        new Date(a.timestamp) - new Date(b.timestamp)
                    );
                });
                
                const sessions = Object.values(sessionsMap);
                console.log("그룹핑된 세션:", sessions);
                setChatSessions(sessions);
            } catch (e) {
                console.error("채팅 내역 로드 중 오류:", e);
                const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
                setChatSessions(sessions);
            }
        } else {
            const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
            setChatSessions(sessions);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    useEffect(() => {
        if (newChatTrigger > 0 || refreshSessionList) {
            loadSessions();
        }
    }, [newChatTrigger, refreshSessionList, loadSessions]);

    const handleLogout = () => {
        const userTheme = localStorage.getItem("theme");
        if (userTheme) {
            localStorage.setItem("theme", userTheme);
        }
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleNewChat = () => {
        if (!isGuest && onNewChat) {
            onNewChat();
        }
    };

    const handleDeleteSession = async (idToDelete) => {
        const confirmed = window.confirm("정말 이 대화를 삭제하시겠습니까?");
        if (!confirmed) return;
        
        setDeletingId(idToDelete);
        
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            
            // 로그인한 사용자인 경우 백엔드 DB에서도 삭제
            if (storedUser && !storedUser.guest) {
                const response = await fetch(`${URLS.BACK}/api/chat/session/${idToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${storedUser.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('세션 삭제에 실패했습니다.');
                }
            }

            // 로컬 상태 업데이트
            const updated = chatSessions.filter((s) => s.id !== idToDelete);
            setChatSessions(updated);
            localStorage.setItem("chatSessions", JSON.stringify(updated));
            
        } catch (error) {
            console.error("세션 삭제 중 오류 발생:", error);
            alert("세션 삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleTitleSave = (id) => {
        const trimmed = editingTitle.trim();
        if (!trimmed) return;

        const updated = chatSessions.map((s) =>
            s.id === id ? { ...s, title: trimmed } : s
        );

        setChatSessions(updated);
        localStorage.setItem("chatSessions", JSON.stringify(updated));
        setEditingId(null);
    };

    const filteredSessions = chatSessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.messages?.some(msg => msg.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <aside className={styles.sidebar}>
            <div>
                <div
                    onClick={() => window.location.reload()}
                    className={`${styles.logoImage} ${styles["logo" + theme.charAt(0).toUpperCase() + theme.slice(1)]}`}
                />

                <div className={styles.actionRow}>
                    <button
                        onClick={handleNewChat}
                        className={`${styles.newChatBtn} ${isGuest ? styles.disabled : ""}`}
                        disabled={isGuest}
                    >
                        + New chat
                    </button>

                    <button className={styles.iconBtn} onClick={() => setShowSearch(!showSearch)} title="Search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                {showSearch && (
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchField}
                            autoFocus
                        />
                        <button className={styles.closeSearchBtn} onClick={() => setShowSearch(false)}>
                            ✕
                        </button>
                    </div>
                )}

                <div className={styles.sectionTitle}>
                    <span>Your conversations</span>
                </div>
            </div>

            <ul className={styles.chatItemList}>
                {isGuest ? (
                    <div style={{ textAlign: "center", color: "#888", padding: "1rem 0" }}>
                        게스트 모드에서는 대화 목록을 사용할 수 없습니다.
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888", padding: "1rem 0" }}>
                        No results
                    </div>
                ) : (
                    filteredSessions.map((session, index) => (
                        <li
                            key={`${session.id}-${index}`}
                            className={`${styles.chatItem} ${deletingId === session.id ? styles.deleting : ""}`}
                            onClick={async () => {
                                if (onSelectChat) onSelectChat(session.id); // 기존 기능 유지

                                const storedUser = JSON.parse(localStorage.getItem("user"));
                                const userId = storedUser?.id;

                                // 대화 내역 → message-response 묶음으로 구성
                                const dialogueHistory = [];
                                for (let i = 0; i < session.messages.length; i++) {
                                    const userMsg = session.messages[i];

                                    // user 메시지 다음에 bot 응답이 따라오는 경우만 처리
                                    if (userMsg.sender === "user") {
                                        const botMsg = session.messages[i + 1];
                                        if (botMsg?.sender === "bot") {
                                            dialogueHistory.push({
                                                id: i + 1,
                                                message: userMsg.text || "",
                                                response: botMsg.text || "",
                                                timestamp: new Date(userMsg.timestamp).toISOString(), // 또는 botMsg.timestamp
                                            });
                                            i++; // bot 메시지는 이미 사용했으므로 skip
                                        }
                                    }
                                }

                                try {
                                    const res = await fetch(`${URLS.MODEL}`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            user_info: {
                                                user_id: String(userId),
                                            },
                                            session_info: {
                                                session_id: session.id,
                                            },
                                            dialog_history: {
                                                history: session.messages.map((msg, index) => ({
                                                    id: index + 1,
                                                    message: msg.sender === "user" ? msg.text : "",
                                                    response: msg.sender === "bot" ? msg.text : "",
                                                    timestamp: new Date(msg.timestamp).toISOString(),
                                                })),
                                            },
                                        }),
                                    });
                                    console.log(JSON.stringify({
                                        user_info: {
                                            user_id: String(userId),
                                        },
                                        session_info: {
                                            session_id: session.id,
                                        },
                                        dialog_history: {
                                            history: dialogueHistory,
                                        },
                                    }));
                                    const result = await res.json();
                                    console.log("✅ 모델 서버 응답:", result);
                                } catch (error) {
                                    console.error("❌ 모델 서버 호출 실패:", error);
                                }
                            }}
                        >
                            <div className={styles.chatTitle}>
                                <img src="/message.svg" alt="chat icon" style={{ width: "16px", height: "16px" }} />
                                {editingId === session.id ? (
                                    <input
                                        className={styles.titleInput}
                                        value={editingTitle}
                                        autoFocus
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => handleTitleSave(session.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleTitleSave(session.id);
                                        }}
                                    />
                                ) : (
                                    <span>{session.title || "Untitled"}</span>
                                )}
                            </div>
                            <div className={styles.chatActions}>
                                <button
                                    className={`${styles.iconBtn} ${styles.editBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(session.id);
                                        setEditingTitle(session.title);
                                    }}
                                    title="Edit title"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                    }}
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6L18.3 20.4a2 2 0 0 1-2 1.6H7.7a2 2 0 0 1-2-1.6L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            <div className={styles.footerButtons}>
                {router.pathname === "/community" ? (
                    <button className={styles.footerButton} onClick={() => router.push("/chat")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        채팅으로 돌아가기
                    </button>
                ) : (
                    <button className={styles.footerButton} onClick={() => router.push("/community")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        커뮤니티
                    </button>
                )}

                {!isGuest && (
                    <button className={styles.footerButton} onClick={() => router.push("/profile")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        My Profile
                    </button>
                )}

                <button className={styles.footerButton} onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                </button>
            </div>

        </aside>
    );
}
