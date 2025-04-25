import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../styles/CommunityPage.module.css";

export default function CommunityPage() {
    const [isGuest, setIsGuest] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setIsGuest(!!storedUser?.guest);

        const likedIds = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
        const mapped = storedPosts.map(post => ({
            ...post,
            liked: likedIds.includes(post.id)
        }));
        setPosts(mapped);
    }, []);

    const handleLike = (postId) => {
        const updated = posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    likes: post.liked ? post.likes - 1 : post.likes + 1,
                    liked: !post.liked
                }
                : post
        );
        setPosts(updated);
        localStorage.setItem("posts", JSON.stringify(updated));

        const likedIds = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        const newLiked = updated.find(p => p.id === postId)?.liked;
        const newList = newLiked
            ? [...new Set([...likedIds, postId])]
            : likedIds.filter(id => id !== postId);
        localStorage.setItem("likedPosts", JSON.stringify(newList));
    };

    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000);

        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };

    const filteredPosts = [...posts]
        .filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className={`${styles.communityPage} ${styles.blueTheme}`}>
            <Sidebar isGuest={isGuest} />
            <main className={styles.mainContent}>
                <div className={styles.topBarWrapper}>
                    <div className={styles.inputSearchBox}>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className={styles.inputField}
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className={styles.searchBtn}>Search</button>
                    </div>
                    <button
                        className={styles.createPostButton}
                        disabled={isGuest}
                        onClick={() => router.push("/community/create")}
                    >
                        Create Post
                    </button>
                </div>

                <div className={styles.postList}>
                    {filteredPosts.map(post => (
                        <div key={post.id} className={styles.postCard}>
                            <div
                                onClick={() => router.push(`/community/post/${post.id}`)}
                                style={{ cursor: "pointer", flex: 1, display: "flex" }}
                            >
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
                                    <div className={styles.postStats}>{post.views?.toLocaleString()} views • {post.likes?.toLocaleString()} likes • {post.comments} comments</div>
                                </div>
                            </div>
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