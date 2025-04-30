import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../../../styles/PostDetail.module.css";
import { v4 as uuidv4 } from "uuid";

export default function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [theme, setTheme] = useState(null);
    const [isNewChat, setIsNewChat] = useState(false);
    const [storedPosts, setStoredPosts] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        setStoredPosts(posts);
    }, []);

    useEffect(() => {
        if (!router.isReady) return;

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
        setIsGuest(!!storedUser?.guest);
    }, [router.isReady, id]);

    const getHotPosts = (posts) => {
        const now = Date.now();

        const corrected = posts.map((post) => {
            const isTooFar = typeof post.createdAt === "number" && post.createdAt - now > 86400000;
            const finalCreatedAt = isTooFar ? now - 5 * 60 * 1000 : post.createdAt;
            return {
                ...post,
                createdAt: finalCreatedAt,
            };
        });


        const hotPosts = corrected
            .filter((post) => {
                const diffInSeconds = Math.floor((now - post.createdAt) / 1000);
                return typeof post.createdAt === "number" && diffInSeconds <= 60 * 60 * 24 * 7;
            })
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);

        return hotPosts;
    };

    useEffect(() => {
        if (!router.isReady) return;
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setTheme(storedUser.theme || "blue");
        }
        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
        const target = storedPosts.find((p) => p.id === id);
        if (!target) return;

        // 조회수 증가
        const updatedPosts = storedPosts.map((p) =>
            p.id === id ? { ...p, views: (p.views || 0) + 1 } : p
        );

        localStorage.setItem("posts", JSON.stringify(updatedPosts));
        setPost({ ...target, views: (target.views || 0) + 1 });
    }, [router.isReady, id]);
    const handleNewChat = () => {
        const newId = uuidv4();
        setIsNewChat(true);
        router.push(`/chat/${newId}`); // ✅ 새로운 대화 시작하면 URL 이동
    };
    const handleSelectChat = (id) => {
        router.push(`/chat/${id}`)}

    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000);

        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };

    const handleLike = () => {
        const posts = JSON.parse(localStorage.getItem("posts") || "[]");
        const updated = posts.map(p =>
            String(p.id) === id
                ? {
                    ...p,
                    likes: p.liked ? p.likes - 1 : p.likes + 1,
                    liked: !p.liked
                }
                : p
        );
        localStorage.setItem("posts", JSON.stringify(updated));
        const refreshed = updated.find(p => String(p.id) === id);
        setPost(refreshed);
    };

    const handleDelete = () => {
        if (window.confirm("정말로 이 글을 삭제하시겠어요?")) {
            const stored = JSON.parse(localStorage.getItem("posts") || "[]");
            const updated = stored.filter(p => String(p.id) !== id);
            localStorage.setItem("posts", JSON.stringify(updated));
            router.push("/community");
        }
    };

    const handleEdit = () => {
        localStorage.setItem("editingPostId", id);
        router.push("/community/create");
    };

    if (!post) return <div className={styles.communityPage}>Loading...</div>;
    if (!theme) return null;
    return (
        <div className={`${styles.communityPage} ${styles[`${theme}Theme`]}`}>
            <Sidebar
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                isGuest={isGuest}
                theme={theme}
            />

            <main className={styles.mainContent}>
                <div className={styles.postCard}>
                    <div style={{ display: "flex" }}>
                        <svg viewBox="0 0 24 24" fill="none" width="80" height="80">
                            <rect x="3" y="3" width="18" height="18" rx="3" fill="#ddd" />
                            <path d="M8 12h8" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                            <path d="M8 16h5" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
                        </svg>

                        <div className={styles.postContent}>
                            <div className={styles.postTitle}>{post.title}</div>
                            <div className={styles.tagGroup}>
                                {(post.tags || []).map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                            <div className={styles.postMeta}>{post.author} • {formatTimeAgo(post.createdAt)}</div>
                            <div className={styles.postBody}>{post.content}</div>
                            <div className={styles.postStats}>
                                <button
                                    onClick={handleLike}
                                    className={post.liked ? styles.heartActive : styles.heartBtn}
                                >
                                    {post.liked ? "❤️" : "🤍"}
                                </button>{post.likes?.toLocaleString()} likes • 👁 {post.views?.toLocaleString()} views
                            </div>
                            <button
                                onClick={() => router.push("/community")}
                                className={styles.cancelBtn}
                            >
                                ← 돌아가기
                            </button>
                            {!isGuest && user?.email === post.saveauthor && (
                                <div className={styles.postActions}>

                                    <button
                                        onClick={handleDelete}
                                        className={styles.deleteBtn}
                                    >
                                        🗑 삭제하기
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        className={styles.editBtn}
                                    >
                                        ✏ 수정하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <aside className={styles.rightSidebar}>
                <div className={styles.sectionBox}>
                    <h4>🔥 Hot Post</h4>
                    <ul className={styles.sideList}>
                        {storedPosts.length > 0 && getHotPosts(storedPosts).map((post) => (
                            <li
                                key={post.id}
                                onClick={() => router.push(`/community/post/${post.id}`)}
                                className={styles.clickableListItem}
                            >
                                {post.title}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.sectionBox}>
                    <h4>💖 Introduce Our Supervisors</h4>
                    <ul className={styles.sideList}>
                        <li>ACT - Accept pain, commit to meaningful life.</li>
                        <li>CBT - Change your thoughts, change your life.</li>
                        <li>IPT - Heal emotions through better relationships.</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}