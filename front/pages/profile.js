import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "@/styles/ProfilePage.module.css";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState("blue");
    const [sessionCount, setSessionCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [myPosts, setMyPosts] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedSessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");
        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");

        if (!storedUser) {
            router.push("/login");
        } else {
            setUser(storedUser);
            setTheme(storedUser.theme || "blue");
            const filtered = storedPosts.filter(post => post.saveauthor === storedUser.email);
            setMyPosts(filtered);
        }

        setSessionCount(storedSessions.length);
        setPostCount(storedPosts.length);
        const totalLikes = storedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        setLikeCount(totalLikes);
    }, [router]);
    const handlePostClick = (postId) => {
        router.push(`community/post/${postId}`); // 포스트 ID를 이용한 라우팅
    };
    const handleSave = () => {
        const updatedUser = { ...user, theme };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated!");
    };
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString(); // 예시: '2025. 4. 28. 오후 8:25:38'
    };
    const handleThemeChange = (userTheme) => {
        setTheme(userTheme);
        // 테마가 변경될 때마다 localStorage에 저장
        localStorage.setItem("theme", userTheme);
    };
    if (!user) return null;

    return (
        <div className={`${styles.pageWrapper} ${styles[theme]}`}>
            <Sidebar isGuest={user.guest} />
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
                                <p className={styles.statNumber}>{sessionCount}</p>
                                <p className={styles.statLabel}>Sessions</p>
                            </div>
                            <div className={styles.statBox}>
                                <p className={styles.statNumber}>{postCount}</p>
                                <p className={styles.statLabel}>Posts</p>
                            </div>
                            <div className={styles.statBox}>
                                <p className={styles.statNumber}>{likeCount}</p>
                                <p className={styles.statLabel}>Likes</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.myPostsSection}>
                        <h3>My Posts</h3>
                        {myPosts.length > 0 ? (
                            <ul>
                                {myPosts.map((post) => (
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