import { useState } from "react";
import styles from "../styles/ChatWindow.module.css";

export default function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: "user",
            text: input,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");
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
                            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                                handleSend();
                            }
                        }}
                        type="text"
                        placeholder="Let me hear your heart"
                        className={styles.inputField}
                    />
                    <button onClick={handleSend} className={styles.sendButton}>
                        <img src="/send.svg" alt="Send" className={styles.sendIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}