import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "@/styles/ProfilePage.module.css";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import URLS from '../config';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState("blue");
    const [sessionCount, setSessionCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [myPosts, setMyPosts] = useState([]);

    const [summary, setSummary] = useState({
        sessionCount: 0,
        postCount: 0,
        likeCount: 0,
        myPosts: []
    });
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("🟡 storedUser:", storedUser);
        if (!storedUser?.id) {
            router.push("/login");
            return;
        }

        setUser(storedUser);
        setTheme(storedUser.theme || "blue");


        const fetchProfileSummary = async () => {
            try {
                // ✅ 1. 포스트 불러오기
                const postRes = await axios.get(`${URLS.BACK}/api/posts`, {
                    headers: {
                        Authorization: storedUser.token ? `Bearer ${storedUser.token}` : undefined
                    }
                });

                const allPosts = postRes.data || [];
                console.log("🟨 postRes.data[0]:", allPosts[0]);
                const myPosts = allPosts.filter(p => p.username === storedUser.username);

                const postCount = myPosts.length;
                const likeCount = myPosts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

                // ✅ 2. 세션 불러오기
                let sessionCount = 0;
                try {
                    const res = await fetch(`${URLS.BACK}/api/chat/history`, {
                        headers: {
                            "Authorization": `Bearer ${storedUser.token}`,
                        }
                    });
                    const data = await res.json();
                    const uniqueSessionIds = new Set();
                    data.forEach(h => {
                        if (String(h.userId) === String(storedUser.id)) {
                            const sid = h.sessionId || h.session_id;
                            if (sid) uniqueSessionIds.add(sid);
                        }
                    });
                    sessionCount = uniqueSessionIds.size;
                } catch (e) {
                    console.warn("⚠ 세션 fetch 실패, 로컬에서 대체 시도");
                    const localSessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
                    sessionCount = localSessions.length;
                }

                // ✅ 3. 요약 저장
                setSummary({
                    postCount,
                    likeCount,
                    sessionCount,
                    myPosts,
                });

                console.log("📊 요약 데이터:", {
                    postCount,
                    likeCount,
                    sessionCount,
                    posts: myPosts,
                });
            } catch (err) {
                console.error("❌ 프로필 요약 로딩 실패:", err);
            }
        };

        fetchProfileSummary();
    }, []);
    const handleNewChat = () => {
        const newId = uuidv4();
        router.push(`/chat/${newId}`);
    };

    const handleSelectChat = (id) => {
        router.push(`/chat/${id}`);
    };

    const handlePostClick = (postId) => {
        router.push(`/community/post/${postId}`);
    };

    const handleSave = () => {
        const updatedUser = { ...user, theme };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated!");
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString(); // '2025. 5. 20. 오후 12:34:56'
    };

    if (!user) return null;

    return (
        <div className={`${styles.pageWrapper} ${styles[theme]}`}>
            <Sidebar
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                isGuest={user.Guest}
                theme={theme}
            />
            <main className={styles.mainContent}>
                <div className={styles.profileCard}>
                    <h2>My Profile</h2>
                    <div className={styles.profileItem}><strong>Email:</strong> {user.email}</div>

                    <div className={styles.profileItem}>
                        <label className={styles.label}>Theme</label>
                        <select
                            className={styles.select}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="pink">Pink</option>
                        </select>
                    </div>

                    <div className={styles.statsSection}>
                        <h3>Activity</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <p className={styles.statNumber}>{summary.sessionCount}</p>
                                <p className={styles.statLabel}>Sessions</p>
                            </div>
                            <div className={styles.statBox}>
                                <p className={styles.statNumber}>{summary.postCount}</p>
                                <p className={styles.statLabel}>Posts</p>
                            </div>
                            <div className={styles.statBox}>
                                <p className={styles.statNumber}>{summary.likeCount}</p>
                                <p className={styles.statLabel}>Likes</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.myPostsSection}>
                        <h3>My Posts</h3>
                        {summary.myPosts.length > 0 ? (
                            <ul>
                                {summary.myPosts.map((post) => (
                                    <li key={post.id} onClick={() => handlePostClick(post.id)} className={styles.postItem}>
                                        {post.title} • {formatDate(post.createdAt)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>작성한 글이 없습니다.</p>
                        )}
                    </div>

                    <div className={styles.accountSettings}>
                        <h3>Account Settings</h3>
                        <button className={styles.secondaryBtn}>Change Password</button>
                        <button className={styles.dangerBtn}>Delete Account</button>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                        <button className={styles.backBtn} onClick={() => router.back()}>Back</button>
                    </div>
                </div>
            </main>
        </div>
    );
}