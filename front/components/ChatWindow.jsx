import { useState, useEffect } from "react";
import styles from "../styles/ChatWindow.module.css";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export default function ChatWindow({ selectedSessionId, newChatTrigger }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [showIntro, setShowIntro] = useState(true); // 💖 Intro 보여줄지 여부

    useEffect(() => {
        if (selectedSessionId && typeof window !== "undefined") {
            const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
            const found = stored.find((s) => s.id === selectedSessionId);
            if (found) {
                setMessages(found.messages || []);
                setSessionId(found.id);
                setShowIntro(found.messages.length === 0); // ✅ 메시지가 없으면 Intro 보여주기
            } else {
                setMessages([]);
                setSessionId(selectedSessionId);
                setShowIntro(true); // ✅ 새 세션은 Intro부터 보여주기
            }
        }
    }, [selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId && newChatTrigger > 0) {
            const newId = uuidv4();
            setSessionId(newId);
            setMessages([]);
            setShowIntro(true);
        }
    }, [newChatTrigger]);

    useEffect(() => {
        if (!sessionId && selectedSessionId) {
            setSessionId(selectedSessionId);
        }
    }, [sessionId, selectedSessionId]);

    const fetchGreeting = async () => {
        try {
            const response = await axios.get("https://model-server-281506025529.asia-northeast3.run.app/gen");
            if (response.data.response) {
                const greeting = {
                    id: Date.now(),
                    sender: "bot",
                    text: response.data.response,
                };
                setMessages([greeting]);
                setShowIntro(false); // ✅ Intro 화면 끄기
            }
        } catch (error) {
            console.error("초기 인사말 불러오기 실패:", error);
            setMessages([]);
            setShowIntro(false);
        }
    };

    const handleIntroClick = () => {
        fetchGreeting(); // ✅ "Let me hear your heart" 클릭 시 서버 호출
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!sessionId) {
            console.warn("❗ sessionId가 아직 null입니다. 저장 중단");
            return;
        }

        const newMessages = [...messages, { id: Date.now(), sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setShowIntro(false);
        setIsSending(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
            });
            const data = await res.json();
            const reply = {
                id: Date.now() + 1,
                sender: "bot",
                text: data.message || "답변을 불러오지 못했어요."
            };
            const updated = [...newMessages, reply];
            setMessages(updated);

            const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
            const sessionIndex = stored.findIndex((s) => s.id === sessionId);

            if (sessionIndex !== -1) {
                stored[sessionIndex].messages = updated;
            } else {
                stored.push({
                    id: sessionId,
                    title: newMessages[0]?.text?.slice(0, 30) || "New Chat",
                    createdAt: new Date(),
                    messages: updated
                });
            }

            localStorage.setItem("chatSessions", JSON.stringify(stored));
        } catch (e) {
            console.error("메시지 저장 중 오류:", e);
        } finally {
            setIsSending(false);
        }
    };

    if (!sessionId) return <div className={styles.chatContainer}>채팅 세션을 초기화 중입니다...</div>;

    return (
        <div className={styles.chatContainer}>
            {messages.length === 0 && showIntro && (
                <div className={styles.emptyMessageBox} onClick={handleIntroClick} style={{ cursor: "pointer" }}>
                    <div className={styles.heartEmoji}>💖</div>
                    <h2 className={styles.emptyTitle}>Let me hear your heart</h2>
                    <p className={styles.emptyDescription}>
                        마음속 이야기를 나눠보세요.<br />제가 경청하고 위로해드릴게요.
                    </p>
                </div>
            )}

            <div className={styles.messageList}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.messageBubble} ${msg.sender === "user" ? styles.userMessage : styles.botMessage}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className={styles.inputWrapper}>
                <div className={styles.inputBox}>
                    <img
                        src="/sound_of_mind.svg"
                        alt="Sound of Mind"
                        className={styles.inputIcon}
                    />
                    <input
                        type="text"
                        placeholder="마음의 소리를 들려주세요"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.nativeEvent.isComposing && !isSending && sessionId) {
                                handleSend();
                            }
                        }}
                        disabled={isSending || !sessionId}
                        className={styles.inputField}
                    />
                    <button onClick={handleSend} disabled={isSending || !sessionId} className={styles.sendButton}>
                        <img src="/send.svg" alt="Send" className={styles.sendIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}