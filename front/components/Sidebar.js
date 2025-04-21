import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Sidebar.module.css";

export default function Sidebar({ isGuest = false }) {
    const router = useRouter();
    const [chatSessions, setChatSessions] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        setChatSessions(sessions);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("chatSessions");
        router.push("/login");
    };

    const handleNewChat = () => {
        if (!isGuest) {
            window.location.reload();
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

    const filteredSessions = chatSessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.messages?.some(msg => msg.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <aside className={styles.sidebar}>
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

                <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: "8px" }} />
                <div className={styles.sectionTitle}>
                    <span>Your conversations</span>
                </div>
                <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "12px" }} />

                <ul className={styles.chatItemList}>
                    {filteredSessions.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#888", padding: "1rem 0" }}>No results</div>
                    ) : (
                        filteredSessions.map((session) => (
                            <li
                                key={session.id}
                                className={`${styles.chatItem} ${deletingId === session.id ? styles.deleting : ""}`}
                            >
                                <div className={styles.chatTitle}>
                                    <img src="/message.svg" alt="chat icon" style={{ width: "16px", height: "16px" }} />
                                    {session.title || "Untitled"}
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6L18.3 20.4a2 2 0 0 1-2 1.6H7.7a2 2 0 0 1-2-1.6L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>

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