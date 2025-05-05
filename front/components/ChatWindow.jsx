import { useState, useEffect } from "react";
import styles from "../styles/ChatWindow.module.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ newChatTrigger, selectedSessionId, theme, isNewChat, setIsNewChat }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [showIntro, setShowIntro] = useState(true); // 💖 Intro 보여줄지 여부
    const [showInputBox, setShowInputBox] = useState(false);
    const [introClicked, setIntroClicked] = useState(false);
    const [introVisible, setIntroVisible] = useState(true);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [typingDots, setTypingDots] = useState("");
    const [botTypingText, setBotTypingText] = useState(""); // 점점 찍힐 텍스트

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;

    const calcDelay = (char) => {
        const base = 40;
        const punctuationPause = /[.,!?]/.test(char) ? 100 : 0;

        return base + punctuationPause;
    };
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeText = async (reply) => {
        setBotTypingText("");
        setIsBotTyping(true);

        const chars = reply.text.split("");
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            setBotTypingText((prev) => prev + char);
            await sleep(calcDelay(char));
        }

        // 최종 메시지만 messages에 저장
        const botMessage = {
            id: Date.now(),
            sender: "bot",
            text: reply.text,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsBotTyping(false);
        setBotTypingText(""); // 깔끔하게 정리
    };

    useEffect(() => {
        if (!isBotTyping) {
            setTypingDots("");
            return;
        }

        const dotInterval = setInterval(() => {
            setTypingDots((prev) => {
                if (prev.length >= 3) return "";
                return prev + ".";
            });
        }, 500); // 0.5초마다 점 추가

        return () => clearInterval(dotInterval);
    }, [isBotTyping]);

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
        if (newChatTrigger > 0 && isNewChat) {
            setMessages([]);
            setShowIntro(true);
            setIntroClicked(false);
            setIntroVisible(true);
            setIsNewChat(false);  // ✅ 초기화 끝났으면 다시 false로
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
                setShowInputBox(true); // ✅ 인트로 사라진 후 입력창 표시
            }
        } catch (error) {
            console.error("초기 인사말 불러오기 실패:", error);
            setMessages([]);
            setShowIntro(false);
            setShowInputBox(true); // ✅ 인트로 사라진 후 입력창 표시
        }
    };

    const handleIntroClick = () => {
        fetchGreeting(); // ✅ "Let me hear your heart" 클릭 시 서버 호출
        setIntroClicked(true); // 클릭했으니까 애니메이션 시작
        setTimeout(() => {
            setIntroVisible(false); // 0.5초 뒤에 실제로 IntroBox 제거
        }, 800); // fadeOutUp 애니메이션 시간과 맞춰야 함
    };

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: input,
            time: formattedTime,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setBotTypingText("");
        setIsBotTyping(true);
        setShowIntro(false);
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
                text: data.message || "답변을 불러오지 못했어요.",
            };

            await typeText(botMessage);

            const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
            const sessionIndex = stored.findIndex((s) => s.id === sessionId);
            const updatedMessages = [...messages, userMessage, botMessage];

            if (sessionIndex !== -1) {
                stored[sessionIndex].messages = updatedMessages;
            } else {
                stored.push({
                    id: sessionId,
                    title: userMessage.text.slice(0, 30) || "New Chat",
                    createdAt: new Date(),
                    messages: updatedMessages,
                });
            }

            localStorage.setItem("chatSessions", JSON.stringify(stored));
        } catch (e) {
            console.error("메시지 저장 중 오류:", e);
        } finally {
            setIsBotTyping(false);
            setIsSending(false);
        }
    };

    if (!sessionId) return <div className={styles.chatContainer}>채팅 세션을 초기화 중입니다...</div>;

    return (
        <div className={`${styles.chatContainer} ${styles[theme]}`}>
            <AnimatePresence>
                {messages.length === 0 && showIntro && introVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 10 }}
                        exit={{ opacity: 0, y: -30}}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`${styles.emptyMessageBox} ${introClicked ? styles.fadeOutUp : ''}`}
                        onClick={() => {
                            handleIntroClick();
                            setIntroClicked(true);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <div className={styles.heartEmoji}>💖</div>
                        <h2 className={styles.emptyTitle}>Let me hear your heart</h2>
                        <p className={styles.emptyDescription}>
                            마음속 이야기를 나눠보세요.<br />제가 경청하고 위로해드릴게요.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.messageList}>
                {messages.map((msg) => {
                    // 사용자 메시지는 무조건 보여주고, bot 메시지만 빈 텍스트 필터링
                    if (msg.sender === "bot" && !msg.text?.trim()) return null;

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className={`${styles.messageBubble} ${
                                msg.sender === "user" ? styles.userMessage : styles.botMessage
                            }`}
                        >
                            <div>{msg.text || " "}</div>
                            {msg.sender === "user" && msg.time && (
                                <div className={styles.timeStamp}>{msg.time}</div>
                            )}
                        </motion.div>
                    );
                })}

                {/* 상담사 입력 중 표시 */}
                {isBotTyping && !botTypingText && (
                    <motion.div
                        key="typing"
                        className={`${styles.messageBubble} ${styles.botMessage}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        상담사가 입력 중입니다{typingDots}
                    </motion.div>
                )}

                {/* 답변 텍스트 점점 출력 */}
                {isBotTyping && botTypingText && (
                    <motion.div
                        key="botReplyTyping"
                        className={`${styles.messageBubble} ${styles.botMessage}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {botTypingText}
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {(messages.length > 0 || introClicked) && (
                    <motion.div
                        initial={{ opacity: 0, y: 150,x: "-30%" }}
                        animate={{ opacity: 1, y: 0, x: "-30%" }}
                        exit={{ opacity: 0, y: 150, x: "-30%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className={`${styles.inputWrapper} ${introClicked && messages.length === 0 ? styles.slideUp : messages.length === 0 ? styles.hidden : ''}`}
                    >
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
                            <button
                                onClick={handleSend}
                                disabled={isSending || !sessionId}
                                className={styles.sendButton}
                            >
                                <img src="/send.svg" alt="Send" className={styles.sendIcon} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}