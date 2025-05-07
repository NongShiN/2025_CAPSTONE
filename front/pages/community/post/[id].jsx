import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../../../styles/PostDetail.module.css";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";

export default function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [theme, setTheme] = useState(null);
    const [storedPosts, setStoredPosts] = useState([]);
    const [user, setUser] = useState(null);
    const hasUpdated = useRef(false);

    // 댓글 상태
    const [commentInput, setCommentInput] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyInput, setReplyInput] = useState("");
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyText, setEditingReplyText] = useState("");
    const isLiked = !isGuest && post?.likedBy?.includes(user?.email);
    useEffect(() => {
        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        setStoredPosts(posts);
    }, []);

    useEffect(() => {
        if (!router.isReady || !id) return;

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setTheme(storedUser.theme || "blue");
            setIsGuest(!!storedUser?.guest);
        }

        const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
        const target = storedPosts.find((p) => p.id === id);
        if (!target) return;

        // ✅ setTimeout으로 React Strict Mode의 useEffect 2번 실행 방지
        const timeout = setTimeout(() => {
            const updatedPosts = storedPosts.map((p) =>
                p.id === id ? { ...p, views: (p.views || 0) + 1 } : p
            );
            localStorage.setItem("posts", JSON.stringify(updatedPosts));
            setPost({ ...target, views: (target.views || 0) + 1 });
        }, 50); // 아주 짧게 지연

        return () => clearTimeout(timeout); // cleanup
    }, [id, router.isReady]);

    const getHotPosts = (posts) => {
        const now = Date.now();
        const corrected = posts.map((post) => {
            const isTooFar =
                typeof post.createdAt === "number" &&
                post.createdAt - now > 86400000;
            const finalCreatedAt = isTooFar
                ? now - 5 * 60 * 1000
                : post.createdAt;
            return { ...post, createdAt: finalCreatedAt };
        });

        return corrected
            .filter((post) => {
                const diff = Math.floor((now - post.createdAt) / 1000);
                return diff <= 60 * 60 * 24 * 7;
            })
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);
    };

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
        const updated = posts.map((p) => {
            if (String(p.id) !== id) return p;

            const likedBy = Array.isArray(p.likedBy) ? [...p.likedBy] : [];
            const hasLiked = likedBy.includes(user.email);

            const newLikedBy = hasLiked
                ? likedBy.filter((u) => u !== user.email)
                : [...likedBy, user.email];

            return {
                ...p,
                likedBy: newLikedBy,
                likes: newLikedBy.length,
            };
        });

        localStorage.setItem("posts", JSON.stringify(updated));
        setPost(updated.find((p) => String(p.id) === id));
    };

    const handleDelete = () => {
        if (window.confirm("정말로 이 글을 삭제하시겠어요?")) {
            const stored = JSON.parse(localStorage.getItem("posts") || "[]");
            const updated = stored.filter((p) => String(p.id) !== id);
            localStorage.setItem("posts", JSON.stringify(updated));
            router.push("/community");
        }
    };

    const handleEdit = () => {
        localStorage.setItem("editingPostId", id);
        router.push("/community/create");
    };

    const handleAddComment = () => {
        if (!commentInput.trim()) return;
        const newComment = {
            id: uuidv4(),
            author: user?.email || "익명",
            text: commentInput,
            createdAt: Date.now(),
            replies: [],
        };
        const updated = storedPosts.map((p) =>
            p.id === id
                ? {
                    ...p,
                    comments: Array.isArray(p.comments)
                        ? [...p.comments, newComment]
                        : [newComment],
                }
                : p
        );
        localStorage.setItem("posts", JSON.stringify(updated));
        setStoredPosts(updated);
        setPost(updated.find((p) => p.id === id));
        setCommentInput("");
    };
    const handleDeleteComment = (commentId) => {
        const updated = storedPosts.map((p) =>
            p.id === id
                ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
                : p
        );
        localStorage.setItem("posts", JSON.stringify(updated));
        setStoredPosts(updated);
        setPost(updated.find((p) => p.id === id));
    };

    const handleEditComment = (commentId, currentText) => {
        setEditingCommentId(commentId);
        setEditingText(currentText);
    };

    const handleSaveEditedComment = () => {
        const updated = storedPosts.map((p) => {
            if (p.id !== id) return p;
            return {
                ...p,
                comments: p.comments.map((c) =>
                    c.id === editingCommentId ? { ...c, text: editingText } : c
                ),
            };
        });
        localStorage.setItem("posts", JSON.stringify(updated));
        setStoredPosts(updated);
        setPost(updated.find((p) => p.id === id));
        setEditingCommentId(null);
        setEditingText("");
    };

    const toggleReplyInput = (commentId) => {
        setReplyingTo((prev) => (prev === commentId ? null : commentId));
        setReplyInput("");
    };

    const handleAddReply = (commentId) => {
        if (!replyInput.trim()) return;
        const newReply = {
            id: uuidv4(),
            author: user?.email || "익명",
            text: replyInput,
            createdAt: Date.now(),
        };
        const updated = storedPosts.map((p) => {
            if (p.id !== id) return p;
            return {
                ...p,
                comments: p.comments.map((c) =>
                    c.id === commentId
                        ? {
                            ...c,
                            replies: Array.isArray(c.replies)
                                ? [...c.replies, newReply]
                                : [newReply],
                        }
                        : c
                ),
            };
        });
        localStorage.setItem("posts", JSON.stringify(updated));
        setStoredPosts(updated);
        setPost(updated.find((p) => p.id === id));
        setReplyInput("");
        setReplyingTo(null);
    };
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("posts") || "[]");
        const corrected = stored.map((p) => ({
            ...p,
            comments: Array.isArray(p.comments) ? p.comments : [],
        }));
        localStorage.setItem("posts", JSON.stringify(corrected));
    }, []);
    if (!post || !theme) return null;

    return (
        <div className={`${styles.communityPage} ${styles[`${theme}Theme`]}`}>
            <Sidebar
                onNewChat={() => router.push(`/chat/${uuidv4()}`)}
                onSelectChat={(sid) => router.push(`/chat/${sid}`)}
                isGuest={isGuest}
                theme={theme}
            />

            <main className={styles.mainContent}>
                <div className={styles.postCard}>
                    {/* 🧠 기존 본문 내용 */}
                    <div className={styles.postContent}>
                        <div className={styles.postTitle}>{post.title}</div>
                        <div className={styles.tagGroup}>
                            {(post.tags || []).map((tag) => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                        <div className={styles.postMeta}>
                            {post.author} • {formatTimeAgo(post.createdAt)}
                        </div>
                        <div className={styles.postBody}>{post.content}</div>
                        <div className={styles.postStats}>
                            <button
                                disabled={isGuest}
                                onClick={handleLike}
                                className={isLiked ? styles.heartActive : styles.heartBtn}
                            >
                                {isLiked ? "❤️" : "🤍"}
                            </button>
                            {post.likes?.toLocaleString()} BPM • 👁 {post.views?.toLocaleString()} views
                        </div>
                        <button onClick={() => router.push("/community")} className={styles.cancelBtn}>
                            ← 돌아가기
                        </button>

                        {!isGuest && user?.email === post.saveauthor && (
                            <div className={styles.postActions}>
                                <button onClick={handleDelete} className={styles.deleteBtn}>🗑 삭제하기</button>
                                <button onClick={handleEdit} className={styles.editBtn}>✏ 수정하기</button>
                            </div>
                        )}
                    </div>

                    {/* 💬 댓글 입력창 (이제 postCard 안에 있음) */}
                    {!isGuest && (
                        <div className={styles.commentForm}>
                            <input
                                type="text"
                                placeholder="댓글을 입력하세요"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                            />
                            <button onClick={handleAddComment}>등록</button>
                        </div>
                    )}

                    {/* 💬 댓글 목록 */}
                    <ul className={styles.commentList}>
                        {Array.isArray(post.comments) && post.comments.length > 0 &&
                            post.comments.map((comment) => (
                                <li key={comment.id} className={styles.commentItem}>
                                    <div className={styles.commentMeta}>
                                        <strong>익명</strong> · {formatTimeAgo(comment.createdAt)}
                                        {user?.email === comment.author && (
                                            <>
                                                <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                                <button onClick={() => handleEditComment(comment.id, comment.text)}>수정</button>
                                            </>
                                        )}
                                        <button onClick={() => toggleReplyInput(comment.id)}>답글</button>
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className={styles.editCommentBox}>
                                            <input
                                                type="text"
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                            />
                                            <button onClick={handleSaveEditedComment}>저장</button>
                                        </div>
                                    ) : (
                                        <p>{comment.text}</p>
                                    )}

                                    {replyingTo === comment.id && (
                                        <div className={styles.replyForm}>
                                            <input
                                                type="text"
                                                placeholder="답글을 입력하세요"
                                                value={replyInput}
                                                onChange={(e) => setReplyInput(e.target.value)}
                                            />
                                            <button onClick={() => handleAddReply(comment.id)}>등록</button>
                                        </div>
                                    )}

                                    <ul className={styles.replyList}>
                                        {comment.replies?.map((reply) => (
                                            <li key={reply.id} className={styles.replyItem}>
                                                <div className={styles.commentMeta}>
                                                    <strong>익명</strong> · {formatTimeAgo(reply.createdAt)}
                                                    {user?.email === reply.author && (
                                                        <>
                                                            <button onClick={() => handleEditReply(comment.id, reply.id, reply.text)}>수정</button>
                                                            <button onClick={() => handleDeleteReply(comment.id, reply.id)}>삭제</button>
                                                        </>
                                                    )}
                                                </div>

                                                {editingReplyId === reply.id ? (
                                                    <div className={styles.editCommentBox}>
                                                        <input
                                                            type="text"
                                                            value={editingReplyText}
                                                            onChange={(e) => setEditingReplyText(e.target.value)}
                                                        />
                                                        <button onClick={() => handleSaveEditedReply(comment.id)}>저장</button>
                                                    </div>
                                                ) : (
                                                    <p>{reply.text}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                    </ul>
                </div>
            </main>

            <aside className={styles.rightSidebar}>
                <div className={styles.sectionBox}>
                    <h4>🔥 Hot Post</h4>
                    <ul className={styles.sideList}>
                        {storedPosts.length > 0 &&
                            getHotPosts(storedPosts).map((p) => (
                                <li
                                    key={p.id}
                                    onClick={() => router.push(`/community/post/${p.id}`)}
                                    className={styles.clickableListItem}
                                >
                                    {p.title}
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