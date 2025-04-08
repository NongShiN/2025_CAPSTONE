import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Sidebar.module.css";

export default function Sidebar({ isGuest = false }) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("chatSessions");
        router.push("/login");
    };

    const handleNewChat = () => {
        if (!isGuest) {
            console.log("New chat created");
        }
    };

    const handleSearch = () => {
        console.log("Search clicked");
    };

    return (
        <aside className={styles.sidebar}>
            <div>
                <div onClick={() => window.location.reload()} className={styles.logo}>
                    Sound of Mind
                </div>

                <div className={styles.newChatGroup}>
                    <button
                        onClick={handleNewChat}
                        className={`${styles.newChatBtn} ${isGuest ? styles.disabled : ""}`}
                        disabled={isGuest}
                        title={isGuest ? "게스트는 새 대화를 생성할 수 없습니다" : "새 대화"}
                    >
                        + New chat
                    </button>
                    <button onClick={handleSearch} className={styles.searchBtn}>
                        <img src="/Magnifying_Glass.svg" alt="Search" style={{ width: "16px", height: "16px" }} />
                    </button>
                </div>

                <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: "8px" }} />
                <div className={styles.sectionTitle}>
                    <span>Your conversations</span>
                    <button
                        className={`${styles.clearBtn} ${isGuest ? styles.disabled : ""}`}
                        disabled={isGuest}
                        title={isGuest ? "게스트는 대화를 삭제할 수 없습니다" : "Clear All"}
                    >
                        Clear All
                    </button>
                </div>
                <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "12px" }} />

                <ul className={styles.chatItemList}>
                    {[
                        "Create Html Game Environment…",
                        "Apply To Leave For Emergency",
                        "What Is UI UX Design?",
                    ].map((title, index) => (
                        <li key={index} className={styles.chatItem}>
                            <img src="/message.svg" alt="chat icon" style={{ width: "16px", height: "16px" }} />
                            {title}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                <button className={styles.footerButton}>
                    <img src="/setting.svg" alt="Settings" style={{ width: "20px", height: "20px" }} />
                    Settings
                </button>

                {/* 유저 메뉴 드롭다운 */}
                <div className={styles.userMenu}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={styles.userButton}
                    >
                        <img src="/file.svg" alt="avatar" className={styles.avatar} />
                        <span>{isGuest ? "Guest" : "Andrew Neilson"}</span>
                    </button>

                    {showMenu && (
                        <div className={styles.dropdown}>
                            {!isGuest && (
                                <button onClick={() => router.push("/profile")}>👤 My Profile</button>
                            )}
                            <button onClick={handleLogout}>🚪 Log Out</button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
