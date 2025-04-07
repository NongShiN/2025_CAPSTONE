import { useRouter } from "next/router";
import styles from "../styles/Sidebar.module.css";

export default function Sidebar() {
    const router = useRouter();

    const handleNewChat = () => {
        console.log("New chat created");
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
                    <button onClick={handleNewChat} className={styles.newChatBtn}>
                        + New chat
                    </button>
                    <button onClick={handleSearch} className={styles.searchBtn}>
                        <img src="/Magnifying_Glass.svg" alt="Search" style={{ width: "16px", height: "16px" }} />
                    </button>
                </div>

                <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: "8px" }} />
                <div className={styles.sectionTitle}>
                    <span>Your conversations</span>
                    <button className={styles.clearBtn}>Clear All</button>
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
                <button className={styles.footerButton}>
                    <img src="/file.svg" alt="avatar" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                    Andrew Neilson
                </button>
            </div>
        </aside>
    );
}