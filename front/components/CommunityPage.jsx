// CommunityPage.jsx - unified top bar (search + post button)
import React from "react";
import Sidebar from "@/components/Sidebar";
import styles from "@/styles/CommunityPage.module.css";

export default function CommunityPage({ theme = "blue" }) {
    return (
        <div className={`${styles.communityPage} ${styles[theme + "Theme"]}`}>
            <Sidebar />
            <main className={styles.mainContent}>
                <div className={styles.topBarWrapper}>
                    <div className={styles.inputSearchBox}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={styles.searchIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className={styles.inputField}
                            placeholder="Search topics or experiences..."
                        />
                        <button className={styles.searchBtn}>Search</button>
                    </div>
                    <button className={styles.createPostButton}>Create Post</button>
                </div>

                <div className={styles.postList}>
                    {[1,2,3,4].map(post => (
                        <div key={post} className={styles.postCard}>
                            <svg viewBox="0 0 24 24" fill="none" width="80" height="80">
                                <rect x="3" y="3" width="18" height="18" rx="3" fill="#ddd" />
                                <path d="M8 12h8" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 16h5" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <div className={styles.postContent}>
                                <div className={styles.postTitle}>Summary of My Chatbot-Assisted Counseling Experience</div>
                                <div className={styles.tagGroup}>
                                    {["finance", "bitcoin", "crypto"].map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.postMeta}>anonym • 3 weeks ago</div>
                                <div className={styles.postStats}>651,324 views • 36,645 likes • 56 comments</div>
                            </div>
                            <button className={styles.heartBtn}>🤍</button>
                        </div>
                    ))}
                </div>
            </main>

            <aside className={styles.rightSidebar}>
                <div className={styles.sectionBox}>
                    <h4>🔥 Hot Post</h4>
                    <ul className={styles.sideList}>
                        <li>Scaling a Business Amidst Tragedy</li>
                        <li>Mental Health as a Founder</li>
                        <li>Growing to $5k MRR in 1 year</li>
                    </ul>
                </div>
                <div className={styles.sectionBox}>
                    <h4>💖 Most Liked This Week</h4>
                    <ul className={styles.sideList}>
                        <li>Happiness & Productivity Solo</li>
                        <li>Bootstrapping Mental Health</li>
                        <li>Community is the New Product</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}
