import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../styles/CreatePost.module.css";
import { v4 as uuidv4 } from "uuid";

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

    const handleSummarize = () => {
        const userTexts = selectedMessages.filter(m => m.sender === "user").map(m => m.text);
        const botTexts = selectedMessages.filter(m => m.sender === "bot").map(m => m.text);
        const summary = botTexts.slice(-2).join(" ");
        const titleText = userTexts[0]?.slice(0, 30) || "대화 요약";
        setTitle(titleText);
        setContent(summary);
    };

    const generateTags = () => {
        const combinedText = selectedMessages.map(m => m.text).join(" ");
        const keywords = ["GPT", "감정", "불안", "위로", "상담", "스트레스", "위기"];
        const found = keywords.filter(k => combinedText.includes(k));
        return found.length > 0 ? found : ["상담", "GPT"];
    };

    const handleSubmit = () => {
        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (isEditMode) {
            const existing = storedPosts.find(p => p.id === editingPostId);
            const updated = {
                ...existing,
                title,
                tags: tags.split(",").map(t => t.trim()),
                content,
            };
            const updatedList = storedPosts.map(p => p.id === editingPostId ? updated : p);
            localStorage.setItem("posts", JSON.stringify(updatedList));
        } else {
            const autoTags = tags.trim() === "" ? generateTags() : tags.split(",").map(t => t.trim());

            const newPost = {
                id: uuidv4(),
                title,
                tags: autoTags,
                content,
                createdAt: Date.now(),
                likes: 0,
                views: 0,
                comments: 0,
                liked: false,
                saveauthor: storedUser.email || "anonym",
                author: "익명",
                timeAgo: "방금 전",
            };
            localStorage.setItem("posts", JSON.stringify([...storedPosts, newPost]));
        }

        router.push("/community");
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
                <div className={styles.container}>
                    <h2 className={styles.heading}>{isEditMode ? "✏ 글 수정하기" : "📢 새 글 작성하기"}</h2>

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

                    {selectedMessages.length > 0 && (
                        <div className={styles.chatPreview}>
                            <h4>💬 대화 미리보기</h4>
                            <div className={styles.chatBox}>
                                {selectedMessages.map((m, idx) => (
                                    <div key={idx}><b>{m.sender === "user" ? "🙋" : "🤖"}</b> {m.text}</div>
                                ))}
                            </div>
                            <button className={styles.summarizeBtn} onClick={handleSummarize}>📝 요약해서 제목/본문에 넣기</button>
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
            </main>
        </div>
        </div>
    );
}
