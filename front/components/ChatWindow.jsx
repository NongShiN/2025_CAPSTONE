import { useState, useEffect } from "react";
import styles from "../styles/ChatWindow.module.css";
import { v4 as uuidv4 } from "uuid";

export default function ChatWindow({ selectedSessionId, newChatTrigger }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        if (selectedSessionId && typeof window !== "undefined") {
            const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
            const found = stored.find((s) => s.id === selectedSessionId);
            if (found) {
                setMessages(found.messages || []);
                setSessionId(found.id);
            } else {
                setMessages([]);
                setSessionId(selectedSessionId);
            }
            setShowIntro(true);
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

    const handleSend = async () => {
        if (!input.trim()) return;

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

            if (typeof window !== "undefined") {
                const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
                const sessionIndex = stored.findIndex((s) => s.id === sessionId);

                if (sessionIndex !== -1) {
                    stored[sessionIndex].messages = updated;
                } else {
                    stored.push({
                        id: sessionId,
                        title: newMessages[0]?.text.slice(0, 30) || "New Chat",
                        createdAt: new Date(),
                        messages: updated
                    });
                }

                localStorage.setItem("chatSessions", JSON.stringify(stored));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {messages.length === 0 && showIntro && (
                <div className={styles.emptyMessageBox}>
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
                            if (e.key === "Enter" && !e.nativeEvent.isComposing && !isSending) {
                                handleSend();
                            }
                        }}
                        disabled={isSending}
                        className={styles.inputField}
                    />
                    <button onClick={handleSend} disabled={isSending} className={styles.sendButton}>
                        <img src="/send.svg" alt="Send" className={styles.sendIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}