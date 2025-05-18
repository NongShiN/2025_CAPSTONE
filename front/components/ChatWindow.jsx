import { useState, useEffect } from "react";
import styles from "../styles/ChatWindow.module.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import URLS from '../config';

export default function ChatWindow({
                                       newChatTrigger,
                                       selectedSessionId,
                                       theme,
                                       isNewChat,
                                       setIsNewChat,
                                       setRefreshSessionList,
                                       isGuest
                                   }) {
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
        const base = 30;
        const punctuationPause = /[.,!?]/.test(char) ? 100 : 0;

        return base + punctuationPause;
    };
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeText = async (fullReplyText) => {
        setBotTypingText("");
        setIsBotTyping(true);

        const sentences = fullReplyText.split(/(?<=[.!?])\s+/); // 문장 단위 분리

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (!sentence) continue;

            const chars = sentence.split("");
            let rendered = "";

            for (let j = 0; j < chars.length; j++) {
                rendered += chars[j];
                setBotTypingText(rendered);
                await sleep(calcDelay(chars[j]));
            }

            // 말풍선 추가
            const botMessage = {
                id: Date.now() + i,
                sender: "bot",
                text: sentence,
            };
            setMessages((prev) => [...prev, botMessage]);
            setBotTypingText("");
            await sleep(300); // 문장 간 딜레이
        }

        setIsBotTyping(false);
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
        if (!selectedSessionId || isNewChat) return;
        setMessages([]);
        setSessionId(null); // 새 세션 초기화
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || storedUser.guest) {
            setMessages([]);
            setSessionId(selectedSessionId);
            setShowIntro(true);
            return;
        }

        const fetchMessages = async () => {
            setSessionId(selectedSessionId);
            try {
                const res = await fetch(`${URLS.BACK}/api/chat/history?sessionId=${selectedSessionId}`, {
                    headers: {
                        "Authorization": `Bearer ${storedUser.token}`
                    }
                });
                console.log("🔎 요청 보낸 세션ID:", selectedSessionId);
                const data = await res.json();
                console.log("✅ 불러온 채팅 내역", data);
                const parsed = [];
                console.log("🔍 실제 받은 메시지들", parsed);

                data.forEach(d => {
                    if (d.sessionId !== selectedSessionId) {
                        console.warn("❌ 다른 세션 ID 발견!", {
                            expected: selectedSessionId,
                            actual: d.sessionId,
                            diff: selectedSessionId.split('').map((c, i) => c === d.sessionId[i] ? ' ' : '^').join('')
                        });
                    }
                });
                data.forEach((msg, index) => {
                    parsed.push({
                        id: msg.id ? `msg_${msg.id}` : `msg_${Date.now()}_${index}`,
                        sender: "user",
                        text: msg.message,
                        timestamp: msg.timestamp,
                        sessionId: msg.sessionId  // ✅ 추가
                    });

                    if (msg.response) {
                        const sentences = msg.response.split(/(?<=[.!?])\s+/).filter(Boolean);
                        sentences.forEach((sentence, i) => {
                            parsed.push({
                                id: msg.id ? `resp_${msg.id}_${i}` : `resp_${Date.now()}_${index}_${i}`,
                                sender: "bot",
                                text: sentence.trim(),
                                timestamp: msg.timestamp,
                                sessionId: msg.sessionId
                            });
                        });
                    }
                });
                console.log("🔍 응답에 포함된 세션ID들:", parsed.map(m => m.sessionId));
                parsed.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(parsed);
                setSessionId(selectedSessionId);
                setShowIntro(parsed.length === 0);
            } catch (error) {
                console.error("채팅 기록 불러오기 실패:", error);
                setMessages([]);
                setShowIntro(true);
            }
        };

        fetchMessages();
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
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;
        try {
            const res = await fetch(`${URLS.MODEL}/gen`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_info: {
                        user_id: userId
                    },
                    query: {
                        user_input: "<SOS>"
                    }
                })
            });
            const data = await res.json();  // 💡 JSON 파싱

            if (data.response) {
            await typeText(data.response);  // ✨ 타이핑 출력
            setShowIntro(false); 
            setShowInputBox(true); 
        }
        } catch (error) {
            console.error("초기 인사말 불러오기 실패:", error);
            setMessages([]);
            setShowIntro(false);
            setShowInputBox(true); // ✅ 인트로 사라진 후 입력창 표시
        }
    };
        
    const handleIntroClick = async () => {
        setIntroClicked(true); // 클릭했으니까 애니메이션 시작

        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const userId = storedUser?.id;
            const sessionIdToSend = selectedSessionId || sessionId;

            const payload = {
                user_info: {
                    user_id: String(userId),
                },
                session_info: {
                    session_id: sessionIdToSend,
                    insight: {
                    },
                    selected_supervisor: "None",
                    cbt_info: {
                        "cbt_log": {},
                        "basic_memory": [],
                        "cd_memory": []
                    },
                    pf_rating: {
                    },
                    ipt_log: {
                        history: []
                    }
                },
                dialog_history: {
                    history: []
                }
            };

            console.log("📤 NewCHat에 대한 selectSession 요청 payload:", payload);

            await fetch(`${URLS.MODEL}/select_session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_info: {
                        user_id: String(userId),
                    },
                    session_info: {
                        session_id: sessionIdToSend,
                        insight:{},
                        selected_supervisor: "None",
                        cbt_info:{
                            cbt_log:{},
                            basic_memory:[],
                            cd_memory:[]
                        },
                        pf_rating:{},
                        ipt_log:{"history": []
                        }
                    },
                    dialog_history: {
                        history:[]
                    },
                }),
            });

            console.log("✅ 인트로 클릭 시 모델 서버에 초기 세션 전송 완료");
        } catch (error) {
            console.error("❌ 인트로 클릭 시 모델 서버 전송 실패:", error);
        }

        // 0.8초 뒤에 인트로 박스 제거
        setTimeout(() => {
            setIntroVisible(false);
        }, 800);

        // 1초 뒤에 그리팅 메시지 출력 시작
        setTimeout(() => {
            fetchGreeting(); // ✨ 타이핑 애니메이션 포함된 인사 출력
        }, 1000);
    };

    async function fetchTitleFromLLM(fullMessages) {
        try {
            const chatText = fullMessages
                .map((m) => `${m.sender === "user" ? "사용자" : "상담사"}: ${m.text}`)
                .join("\n");

            const res = await fetch("/api/title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: chatText }),
            });

            const data = await res.json();
            return data.title;
        } catch (e) {
            console.error("제목 생성 실패:", e);
            return "";
        }
    }
    const handleSend = async () => {
        const currentSessionId = selectedSessionId || sessionId;
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;

        if (!input.trim() || !currentSessionId) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: input,
            time: formattedTime,
        };

        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setBotTypingText("");
        setIsBotTyping(true);
        setShowIntro(false);
        setIsSending(true);

        try {
            // 1. 모델 응답 받기
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_info: {
                        user_id: userId
                    },
                    query: {
                        user_input: input
                    }
                })
            });
            console.log("📦 요청 바디:", { message: input, userId });
            const data = await res.json();
            const replyText = data.message || "답변을 불러오지 못했어요.";

            await typeText(replyText);

            // 2. 메시지 UI 구성
            const botMessages = replyText
                .split(/(?<=[.!?])\s+/)
                .filter(Boolean)
                .map((text, i) => ({
                    id: Date.now() + i + 1,
                    sender: "bot",
                    text: text.trim(),
                }));

            const updatedMessages = [...newMessages, ...botMessages];
            setMessages(updatedMessages);

            // 3. title 생성
            const generatedTitle = await fetchTitleFromLLM(updatedMessages);
            console.log("🎯 생성된 제목:", generatedTitle);

            // 4. 메시지 저장 (한 번만)
            const storedUser = JSON.parse(localStorage.getItem("user"));

            await fetch(`${URLS.BACK}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedUser.token}`
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    response: replyText,
                    sessionId: currentSessionId,
                    title: generatedTitle || userMessage.text.slice(0, 30),
                    insight: data.insight || "",
                    cognitiveDistortion: data.cognitiveDistortion || "",
                    severity: data.severity || 0
                })
            });

            await new Promise((resolve) => setTimeout(resolve, 300)); // 💡 300ms 딜레이 추가
            await fetch(`${URLS.BACK}/api/chat/title`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser.token}`,
                },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    title: generatedTitle,
                }),
            });

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
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
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
                        transition={{ duration: 1.5 }}
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