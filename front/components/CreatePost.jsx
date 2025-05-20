// ✅ ProfilePage.jsx 백엔드 연동을 위한 통합 리팩토링 버전

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "@/styles/ProfilePage.module.css";
import { v4 as uuidv4 } from "uuid";
<<<<<<< HEAD
import URLS from "@/config";
=======
import axios from "axios";
import URLS from '../config';
>>>>>>> origin/refactor#91v3

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
        if (!storedUser) {
            router.push("/login");
            return;
        }

        setUser(storedUser);
        setTheme(storedUser.theme || "blue");

        const fetchData = async () => {
            try {
                const token = storedUser.token;
                const headers = { Authorization: `Bearer ${token}` };

                // ✅ 1. 세션 내역 가져오기
                const sessionsRes = await fetch(`${URLS.BACK}/api/chat/history`, { headers });
                const sessions = await sessionsRes.json();
                const mySessions = sessions.filter(s => s.user_id === storedUser.id);
                setSessionCount(mySessions.length);

                // ✅ 2. 게시글 가져오기
                const postsRes = await fetch(`${URLS.BACK}/api/posts`, { headers });
                const allPosts = await postsRes.json();
                const myPosts = allPosts.filter(p => p.saveauthor === storedUser.email);
                setMyPosts(myPosts);
                setPostCount(myPosts.length);

                // ✅ 3. 좋아요 수 계산
                const totalLikes = myPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
                setLikeCount(totalLikes);

            } catch (err) {
                console.error("🔥 프로필 데이터 로딩 실패:", err);
            }
        };

        fetchData();
    }, [router]);


    useEffect(() => {
        const { id } = router.query;
        if (id) {
            setIsEditMode(true);
            setEditingPostId(id);
            // 기존 게시글 데이터 불러오기
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`${URLS.BACK}/api/posts/${id}`);
                    const post = response.data;
                    setTitle(post.title);
                    setContent(post.content);
                    setTags(post.tags.join(", "));
                } catch (err) {
                    console.error("게시글을 불러오지 못했습니다.", err);
                    alert("게시글을 불러오지 못했습니다.");
                    router.push("/community");
                }
            };
            fetchPost();
        }
    }, [router.query]);

    const handleNewChat = () => {
        const newId = uuidv4();
        router.push(`/chat/${newId}`);
    };

    const handleSelectChat = (id) => {
        router.push(`/chat/${id}`);
    };

<<<<<<< HEAD
    const handlePostClick = (postId) => {
        router.push(`/community/post/${postId}`);
=======
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
>>>>>>> origin/refactor#91v3
    };

    const handleSave = () => {
        const updatedUser = { ...user, theme };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated!");
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
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
                            <div className={styles.postListScrollArea}>
                                <ul>
                                    {myPosts.map((post) => (
                                        <li
                                            key={post.id}
                                            onClick={() => handlePostClick(post.id)}
                                            className={styles.postItem}
                                        >
                                            {post.title} • {formatDate(post.created_at)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
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