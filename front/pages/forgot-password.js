import React, { useState,useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/LoginPage.module.css";

const ResetPasswordPage = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        // 실제 메일 전송 로직은 추후 백엔드 연동 필요
        alert(`If an account exists for ${email}, a reset link has been sent.`);
    };
    const chatExamples = [
        "💬 지금 이 시간, 어떤 생각이나 감정이 머물고 있나요?",
        "💬 오늘 자신에게 해주고 싶은 말이 있다면 무엇인가요?",
        "💬 지금 마음이 가는 이야기를 하나 꺼내어 나눠보실래요?",
        "💬 지금 가장 하고 싶은 말이 있다면, 무엇일까요?",
        "💬 조금 힘든 일이 있었다면 어떤 점이 특히 힘들게 느껴졌는지 나눠볼 수 있을까요?",
        "💬 오늘 어떤 하루가 되기를 바라시나요?"
    ];
    const [currentExample, setCurrentExample] = useState(chatExamples[0]);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentExample(() => {
                const nextIndex = Math.floor(Math.random() * chatExamples.length);
                return chatExamples[nextIndex];
            });
        }, 2200); // 2.2초 간격

        return () => clearInterval(interval);
    }, []);
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <img src="/logo.png" alt="로고" className={styles.logo} />
                <h1> 얘기하고, 공유하세요 — 지금, 마음의소리에서 </h1>
                <p>당신의 심리를 이해하며 공감해주는 챗봇을 통해 마음 속 이야기를 펼쳐보세요</p>
                <div className={styles.chatExample}>{currentExample}</div>
            </div>

            <div className={styles.right}>
                <div className={styles.loginBox}>
                    <h2 className={styles.title}>비밀번호 재설정</h2>

                    <p style={{ textAlign: "center", fontSize: "14px", marginBottom: "16px" }}>
                        이메일 주소를 입력해주시면 비밀번호를 재설정 할 수 있는 링크를 보내드릴게요.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label>이메일</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.icon}>📧</span>
                                <input
                                    type="email"
                                    placeholder="이메일을 입력해주세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button className={styles.loginBtn} type="submit">
                            재설정 링크 보내기
                        </button>
                    </form>

                    <p
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            fontSize: "14px",
                            color: "#888",
                        }}
                    >
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "#5B75FF",
                                cursor: "pointer",
                            }}
                            onClick={() => router.push("/login")}
                        >
                            로그인화면으로 돌아가기
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;