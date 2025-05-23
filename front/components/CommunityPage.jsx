import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../styles/CommunityPage.module.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import URLS from '../config';

export default function CommunityPage() {
    const [isGuest, setIsGuest] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const [theme, setTheme] = useState(null);
    const [newChatTrigger, setNewChatTrigger] = useState(0);
    const [refreshSessionList, setRefreshSessionList] = useState(0);
    const [commentCounts, setCommentCounts] = useState({}); // postId: count
    const { id } = router.query;
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setIsGuest(!!storedUser?.guest);
        if (storedUser) {
            setTheme(storedUser.theme || "blue");
        }
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${URLS.BACK}/api/posts`);
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const handleSelectChat = (sessionId) => {
        router.push(`/chat/${sessionId}`);
    };

    const handleNewChat = () => {
        const newId = uuidv4();
        router.push(`/chat/${newId}`);
        setNewChatTrigger(prev => prev + 1);
        setRefreshSessionList(prev => prev + 1);
    };

    const formatTimeAgo = (isoString) => {
        if (!isoString) return '';

        const now = Date.now();
        const createdTime = new Date(isoString).getTime(); // ← 여기서 문자열 → 숫자 변환
        const diff = Math.floor((now - createdTime) / 1000); // 초 단위 차이

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

    useEffect(() => {
        const fetchCommentCount = async (postId) => {
            try {
                const res = await axios.get(`${URLS.BACK}/api/comments/post/${postId}`);
                return Array.isArray(res.data) ? res.data.length : 0;
            } catch (err) {
                console.error(`❌ 댓글 수 실패 (postId: ${postId})`, err);
                return 0;
            }
        };

        const fetchAllCommentCounts = async () => {
            const newCounts = {};
            await Promise.all(posts.map(async (post) => {
                const count = await fetchCommentCount(post.id);
                newCounts[post.id] = count;
            }));
            setCommentCounts(newCounts); // ✅ 이건 posts를 변경하지 않음
        };

        if (posts.length > 0) {
            fetchAllCommentCounts();
        }
    }, [posts]);

    const getHotPosts = (posts) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return posts
            .filter(post => new Date(post.createdAt) >= sevenDaysAgo)
            .sort((a, b) => b.likeCount - a.likeCount)
            .slice(0, 3); // 상위 3개만 보여주기 (원하면 조절 가능)
    };

    useEffect(() => {
        console.log("🔥 posts 내용:", posts);
    }, [posts]);
    if (!theme) return null;

    return (
        <div className={`${styles.communityPage} ${styles[`${theme}Theme`]}`}>
            <Sidebar
                isGuest={isGuest}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                newChatTrigger={newChatTrigger}
                refreshSessionList={refreshSessionList}
                theme={theme}
            />
            <main className={styles.mainContent}>
                <div className={styles.topBarWrapper}>
                    <div className={styles.inputSearchBox}>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className={styles.inputField}
                            placeholder="검색어를 입력하세요..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className={styles.createPostButton}
                        disabled={isGuest}
                        onClick={() => router.push("/community/create")}
                    >
                        글 작성하기
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
                                    <div className={styles.postMeta}>익명 • {formatTimeAgo(post.createdAt)}</div>

                                    <div className={styles.postStats}>
                                        {post.likeCount?.toLocaleString() || 0} BPM
                                        • {post.viewCount?.toLocaleString() || 0} 조회수
                                        • 💬 {post.commentCount || 0} 댓글
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <aside className={styles.rightSidebar}>
                <div className={styles.sectionBox}>
                    <h4>🔥 주간 인기글</h4>
                    <ul className={styles.sideList}>
                        {posts.length > 0 && getHotPosts(posts).map((post) => (
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
                    <h4>💖 상담가들을 소개합니다</h4>
                    <ul className={styles.sideList}>
                        <li>ACT - 고통을 수용하고, 가치 있는 삶을 선택하세요.</li>
                        <li>CBT - 생각을 바꾸면 감정과 행동도 달라집니다.</li>
                        <li>IPT - 관계를 돌아보고, 감정을 회복하세요.</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}