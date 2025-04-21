import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Sidebar.module.css";

export default function Sidebar({ isGuest = false, onNewChat, onSelectChat, newChatTrigger }) {
    const router = useRouter();
    const [chatSessions, setChatSessions] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const loadSessions = () => {
        const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        setChatSessions(sessions);
    };

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        loadSessions();
    }, [newChatTrigger]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("chatSessions");
        router.push("/login");
    };

    const handleNewChat = () => {
        if (!isGuest && onNewChat) {
            onNewChat();
        }
    };

    const handleDeleteSession = (idToDelete) => {
        const confirmed = window.confirm("정말 이 대화를 삭제하시겠습니까?");
        if (!confirmed) return;
        setDeletingId(idToDelete);
        setTimeout(() => {
            const updated = chatSessions.filter((s) => s.id !== idToDelete);
            setChatSessions(updated);
            localStorage.setItem("chatSessions", JSON.stringify(updated));
            setDeletingId(null);
        }, 250);
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
            {/* 상단 영역 */}
            <div>
                <div onClick={() => window.location.reload()} className={styles.logo}>
                    <img src="/logo.png" alt="Sound of Mind Logo" className={styles.logoImage} />
                </div>

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
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

            {/* 중간 스크롤 영역 */}
            <ul className={styles.chatItemList}>
                {filteredSessions.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888", padding: "1rem 0" }}>No results</div>
                ) : (
                    filteredSessions.map((session) => (
                        <li
                            key={session.id}
                            className={`${styles.chatItem} ${deletingId === session.id ? styles.deleting : ""}`}
                            onClick={() => onSelectChat && onSelectChat(session.id)}
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

            {/* 하단 고정 버튼 */}
            <div className={styles.footerButtons}>
                {!isGuest && (
                    <button className={styles.footerButton} onClick={() => router.push("/profile")}>
                        <img src="/file.svg" alt="profile icon" className={styles.avatar} />
                        My Profile
                    </button>
                )}
                <button className={styles.footerButton} onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
