import { useState, useEffect } from "react";
import styles from "../styles/ChatWindow.module.css";
import { v4 as uuidv4 } from "uuid";

export default function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("상담스타일을 선택해주세요");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [sessionId, setSessionId] = useState(null);

    const counselingStyles = ["다정한", "공감과 위로", "현실적인 조언"];
    const emotionButtons = ["슬퍼요 😢", "불안해요 😨", "조언이 필요해요 💡"];

    useEffect(() => {
        const storedSessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        if (storedSessions.length > 0) {
            const lastSession = storedSessions[storedSessions.length - 1];
            setSessionId(lastSession.id);
            setMessages(lastSession.messages || []);
        }
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;

        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            setSessionId(currentSessionId);
        }

        const newMessage = {
            id: Date.now(),
            sender: "user",
            text: input,
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");
        setShowIntro(false);

        const storedSessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        const sessionIndex = storedSessions.findIndex((s) => s.id === currentSessionId);

        if (sessionIndex !== -1) {
            storedSessions[sessionIndex].messages = updatedMessages;
        } else {
            storedSessions.push({
                id: currentSessionId,
                title: input.slice(0, 30),
                createdAt: new Date(),
                messages: updatedMessages,
            });
        }

        localStorage.setItem("chatSessions", JSON.stringify(storedSessions));
    };

    return (
        <div className={styles.chatContainer}>
            {/* 상담 스타일 선택 */}
            <div className={styles.dropdownWrapper}>
                <button
                    className={styles.dropdownToggle}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                >
                    <span>{selectedStyle}</span>
                </button>

                {dropdownOpen && (
                    <ul className={styles.dropdownList}>
                        {counselingStyles.map((style) => (
                            <li
                                key={style}
                                className={styles.dropdownItem}
                                onClick={() => {
                                    setSelectedStyle(style);
                                    setDropdownOpen(false);
                                }}
                            >
                                {style}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 소개 메시지 */}
            {messages.length === 0 && showIntro && (
                <div className={styles.emptyMessageBox}>
                    <div className={styles.heartEmoji}>💖</div>
                    <h2 className={styles.emptyTitle}>Let me hear your heart</h2>
                    <p className={styles.emptyDescription}>
                        Start by sharing anything on your mind.<br />I'm here to listen and support you.
                    </p>
                    <div className={styles.emotionButtons}>
                        {emotionButtons.map((emotion, idx) => (
                            <button key={idx} className={styles.emotionBtn} onClick={() => setShowIntro(false)}>
                                {emotion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 메시지 출력 영역 */}
            <div className={styles.messageList}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.messageBubble} ${
                            msg.sender === "user" ? styles.userMessage : styles.botMessage
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* 입력창 */}
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
