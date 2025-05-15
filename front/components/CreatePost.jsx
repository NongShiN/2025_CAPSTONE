import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../styles/CreatePost.module.css";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import URLS from '../config';

export default function CreatePost() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [theme, setTheme] = useState(null);
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isNewChat, setIsNewChat] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        const id = localStorage.getItem("editingPostId");
        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
        const chats = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        setChatSessions(chats);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setTheme(storedUser.theme || "blue");
        }
        if (id) {
            const target = storedPosts.find(p => String(p.id) === id);
            if (target) {
                setTitle(target.title);
                setTags((target.tags || []).join(", "));
                setContent(target.content);
                setIsEditMode(true);
                setEditingPostId(target.id);
            }
            localStorage.removeItem("editingPostId");
        }
    }, []);

    useEffect(() => {
        const target = chatSessions.find(s => s.id === selectedSessionId);
        if (target) {
            setSelectedMessages(target.messages);
        } else {
            setSelectedMessages([]);
        }
    }, [selectedSessionId, chatSessions]);

    const handleNewChat = () => {
        const newId = uuidv4();
        setIsNewChat(true);
        router.push(`/chat/${newId}`); // ✅ 새로운 대화 시작하면 URL 이동
    };
    const handleSelectChat = (id) => {
        router.push(`/chat/${id}`)}

    const handleSummarize = async () => {
        if (!selectedSessionId || selectedMessages.length === 0) return;

        setIsSummarizing(true); // ✅ 생성중 상태 ON

        try {
            const res = await fetch('/api/gemini/generate-post-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: selectedMessages })
            });

            const data = await res.json();
            setTitle(data.title || "제목 없음");
            setContent(data.summary || "");
            setTags(data.tag || "기타"); // 자동 태그 반영
        } catch (err) {
            console.error('요약 실패:', err);
            alert("요약 생성에 실패했습니다.");
        } finally {
            setIsSummarizing(false); // ✅ 완료 후 상태 OFF
        }
    };

    const handleSubmit = async () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const postData = {
            title,
            tags: tags.split(",").map(t => t.trim()),
            content
        };
        try {
            if (isEditMode) {
                await axios.put(`${URLS.BACK}/api/posts/${editingPostId}`, postData, {
                    headers: {
                        Authorization: storedUser?.token ? `Bearer ${storedUser.token}` : undefined
                    }
                });
            } else {
                await axios.post(`${URLS.BACK}/api/posts`, postData, {
                    headers: {
                        Authorization: storedUser?.token ? `Bearer ${storedUser.token}` : undefined
                    }
                });
            }
            router.push("/community");
        } catch (err) {
            alert("게시글 저장에 실패했습니다.");
            console.error(err);
        }
    };
    if (!theme) return null;
    return (
        <div className={`${styles.communityPage} ${styles[`${theme}Theme`]}`}>
        <div className={styles.createPostPage}>
            <Sidebar
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                theme={theme}
                 />
            <main className={styles.mainContent}>
                <div className={styles.scrollWrapper}>
                <div className={styles.container}>
                    <h2 className={styles.heading}>
                        {isEditMode ? "✏ 글 수정하기" : "📢 새 글 작성하기"}
                    </h2>

                    {/* 🔧 여기 flex 줄로 감쌈 */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>🧠 대화 선택</label>
                            <select
                                className={styles.select}
                                value={selectedSessionId || ""}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                            >
                                <option value="">대화를 선택하세요</option>
                                {chatSessions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className={styles.summarizeBtn}
                            onClick={handleSummarize}
                            disabled={!selectedSessionId || selectedMessages.length === 0}
                            style={{
                                height: "38px", // 드롭다운과 동일하게 맞춤
                                alignSelf: "flex-end", // flex 정렬이 밀릴 때 아래로 붙게
                                marginBottom: "5px",  // 라벨과 버튼 높이 맞추기
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isSummarizing ? (
                                <div className={styles.spinner}></div>
                            ) : (
                                "요약하여 제목/본문 넣기"
                            )}
                        </button>
                    </div>

                    {selectedMessages.length > 0 && (
                        <div className={styles.chatPreview}>
                            <h4>💬 대화 미리보기</h4>
                            <div className={styles.chatBox}>
                                {selectedMessages.map((m, idx) => (
                                    <div key={idx}>
                                        <b>{m.sender === "user" ? "🙋" : "🤖"}</b> {m.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>제목</label>
                        <input
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>본문</label>
                        <textarea
                            className={styles.textarea}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>태그</label>
                        <input
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="예: 감정, GPT, 공감"
                        />
                    </div>

                    <div className={styles.buttonRow}>
                        <button className={styles.submitBtn} onClick={handleSubmit}>
                            {isEditMode ? "수정 완료" : "등록하기"}
                        </button>
                        <button className={styles.cancelBtn} onClick={() => router.back()}>
                            취소
                        </button>
                    </div>
                </div>
                </div>
            </main>
        </div>
        </div>
    );
}