import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import styles from "../../../styles/PostDetail.module.css";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import URLS from '@/config';

export default function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [theme, setTheme] = useState("blue");
    const [user, setUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
        if (!router.isReady || !id) return;
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setTheme(storedUser.theme || "blue");
            setIsGuest(!!storedUser?.guest);
        }
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${URLS.BACK}/api/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                setPost(null);
                console.error("게시글을 불러오지 못했습니다.", err);
            }
        };
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${URLS.BACK}/api/comments/post/${id}`, {
                    headers: {
                        Authorization: user?.token ? `Bearer ${user.token}` : undefined
                    }
                });

                const commentsArray = response.data?.comments || response.data; // fallback
                console.log("📌 백에서 받은 commentsArray:", commentsArray);

                if (!Array.isArray(commentsArray)) {
                    console.error("❌ comments가 배열이 아님!", commentsArray);
                    return;
                }

                const cleaned = commentsArray.map((c) => ({
                    id: c.id,
                    content: c.content ?? c.comment ?? "",
                    createdAt: c.createdAt ?? c.created_at ?? "",
                    userId: c.userId ?? c.user_id ?? null
                }));

                setComments(cleaned);
                console.log("📌 최종 comments 상태:", cleaned);
            } catch (err) {
                console.error("❌ 댓글 로딩 실패:", err);
                setComments([]);
            }
        };
        console.log("📌 최종 comments 상태:", comments);
        fetchPost();
        fetchComments();
    }, [id, router.isReady]);
    const formatCreatedAt = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    useEffect(() => {
        if (!router.isReady || !id || !user?.token) return;

        const increaseViewCount = async () => {
            try {
                await axios.post(
                    `${URLS.BACK}/api/posts/${id}/view`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
            } catch (err) {
                console.error("조회수 증가 실패:", err);
            }
        };

        increaseViewCount();
    }, [id, router.isReady, user?.token]);
    // 좋아요
    const handleLike = async () => {
        try {
            await axios.post(`${URLS.BACK}/api/posts/${id}/like`, {}, {
                headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined }
            });
            const response = await axios.get(`${URLS.BACK}/api/posts/${id}`);
            setPost(response.data);
        } catch (err) {
            alert("좋아요 처리에 실패했습니다.");
        }
    };

    // 게시글 삭제 (작성자만)
    const handleDelete = async () => {
        if (!window.confirm("정말로 이 글을 삭제하시겠어요?")) return;
        try {
            await axios.delete(`${URLS.BACK}/api/posts/${id}`, {
                headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined }
            });
            router.push("/community");
        } catch (err) {
            alert("삭제 권한이 없거나 실패했습니다.");
        }
    };

    // 게시글 수정 (작성자만)
    const handleEdit = () => {
        router.push(`/community/create?id=${id}`);
    };

    // 댓글 작성
    const handleAddComment = async () => {
        if (!commentInput || !commentInput.trim()) return;
        console.log({ postId: post.id, userId: user.id, content: commentInput });
        try {
            await axios.post(`${URLS.BACK}/api/comments`, {
                postId: post.id,
                userId: user.id,
                content: commentInput
            }, {
                headers: {
                    Authorization: user?.token ? `Bearer ${user.token}` : undefined
                }
            });
            setCommentInput("");
            const response = await axios.get(`${URLS.BACK}/api/comments/post/${id}`, {
                headers: {
                    Authorization: user?.token ? `Bearer ${user.token}` : undefined
                }
            });
            setComments(response.data);
        } catch (err) {
            alert("댓글 등록에 실패했습니다.");
        }
    };

    // 댓글 삭제 (작성자만)
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${URLS.BACK}/api/comments/${commentId}?userId=${user.id}`, {
                headers: {
                    Authorization: user?.token ? `Bearer ${user.token}` : undefined
                }
            });
            const response = await axios.get(`${URLS.BACK}/api/comments/post/${id}`);
            setComments(response.data);
        } catch (err) {
            alert("댓글 삭제 권한이 없거나 실패했습니다.");
        }
    };

    // 댓글 수정 (작성자만)
    const handleEditComment = (commentId, currentText) => {
        setEditingCommentId(commentId);
        setEditingText(currentText);
    };
    const handleSaveEditedComment = async () => {
        try {
            await axios.put(`${URLS.BACK}/api/comments/${editingCommentId}?userId=${user.id}`, {
                postId: post.id,
                userId: user.id,
                content: editingText
            }, {
                headers: {
                    Authorization: user?.token ? `Bearer ${user.token}` : undefined
                }
            });
            const response = await axios.get(`${URLS.BACK}/api/comments/post/${id}`);
            setComments(response.data);
            setEditingCommentId(null);
            setEditingText("");
        } catch (err) {
            alert("댓글 수정 권한이 없거나 실패했습니다.");
        }
    };

    // 댓글 답글/수정/삭제 등은 별도 구현 필요(현재 백엔드 구조상 단일 댓글만 지원)

    if (!post || !theme) return null;
    const isPostAuthor = user && post && user.username === post.username;
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
                    <div className={styles.postContent}>
                        <div className={styles.postTitle}>{post.title}</div>
                        <div className={styles.tagGroup}>
                            {(post.tags || []).map((tag) => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                        <div className={styles.postMeta}>
                            익명 • {formatCreatedAt(post.createdAt)}
                        </div>
                        <div className={styles.postBody}>{post.content}</div>
                        <div className={styles.postStats}>
                            <button
                                disabled={isGuest}
                                onClick={handleLike}
                                className={styles.heartBtn}
                            >
                                ❤️
                            </button>
                            {post.likeCount?.toLocaleString()} BPM • 👁 {post.viewCount?.toLocaleString()} 조회수
                        </div>
                        <button onClick={() => router.push("/community")} className={styles.cancelBtn}>
                            ← 돌아가기
                        </button>
                        {isPostAuthor && (
                            <div className={styles.postActions}>
                                <button onClick={handleDelete} className={styles.deleteBtn}>🗑 삭제하기</button>
                                <button onClick={handleEdit} className={styles.editBtn}>✏ 수정하기</button>
                            </div>
                        )}
                    </div>
                    {!isGuest && (
                        <div className={styles.commentForm}>
                            <input
                                type="text"
                                placeholder="댓글을 입력하세요"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                            />
                            <button className={`${styles.commentButton}`} onClick={handleAddComment}>등록</button>
                        </div>
                    )}
                    <ul className={styles.commentList}>
                        {Array.isArray(comments) && comments.length > 0 &&
                            comments.map((comment) => (
                                <li key={comment.id} className={styles.commentItem}>
                                    <div className={styles.commentMeta}>
                                        <strong>익명</strong> · {formatCreatedAt(comment.createdAt)}
                                        {user?.id === comment.userId && (
                                            <>
                                                <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                                <button onClick={() => handleEditComment(comment.id, comment.content)}>수정</button>
                                            </>
                                        )}
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
                                        <p>{comment.content}</p>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>
            </main>
            <aside className={styles.rightSidebar}>
                {/* Hot Post, Supervisor 소개 등 기존 UI 그대로 유지 */}
            </aside>
        </div>
    );
}