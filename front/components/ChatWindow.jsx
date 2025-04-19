import { useState } from "react";
import styles from "../styles/ChatWindow.module.css";

export default function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsSending(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();
            const botMessage = {
                id: Date.now() + 1,
                sender: "bot",
                text: data.message || "Sorry, I couldn't understand.",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Failed to fetch model response:", error);
            const errorMessage = {
                id: Date.now() + 2,
                sender: "bot",
                text: "⚠️ 서버 오류가 발생했어요.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* 메시지 출력 영역 */}
            <div className={styles.messageList}>
                {messages.length === 0 ? (
                    <p className={styles.emptyMessage}>Let me hear your heart</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageBubble} ${
                                msg.sender === "user" ? styles.userMessage : styles.botMessage
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))
                )}
            </div>

            {/* 입력창 영역 */}
            <div className={styles.inputWrapper}>
                <div className={styles.inputBox}>
                    <img
                        src="/sound_of_mind.svg"
                        alt="Sound of Mind"
                        className={styles.inputIcon}
                    />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.nativeEvent.isComposing && !isSending) {
                                handleSend();
                            }
                        }}
                        type="text"
                        placeholder="Let me hear your heart"
                        className={styles.inputField}
                        disabled={isSending}
                    />
                    <button onClick={handleSend} className={styles.sendButton} disabled={isSending}>
                        <img src="/send.svg" alt="Send" className={styles.sendIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}
