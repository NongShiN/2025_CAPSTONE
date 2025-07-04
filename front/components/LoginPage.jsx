import React, { useState,useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/LoginPage.module.css";
import { signIn } from "next-auth/react";
import URLS from '../config';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    }, 2500); // 2.5초 간격

    return () => clearInterval(interval);
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("URL:", URLS);
    try {
      const res = await fetch(`${URLS.BACK}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
  
      const data = await res.json(); 
  
    
    if (!res.ok) {

      alert(data.message || 'Login failed');
      return;
    }
  
      // 1. user 정보 저장
      localStorage.setItem("user", JSON.stringify(data));
      const payload = {
        user_id: data.id,
        insight: JSON.parse(data.user_insight)
      };
      // 2. userId를 모델 서버에 전송
      await fetch(`${URLS.MODEL}/load_counselor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: data.id,  // 여기에 필요한 데이터 추가
          insight: JSON.parse(data.user_insight)
        })
      });
      console.log(data)
      console.log("로그인시 모델에 응답 요청:", payload)
      router.push("/chat");
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || "로그인 정보가 올바르지 않습니다.");
    }
  };
  

  const handleGuestLogin = () => {
    const guestUser = { guest: true };
    localStorage.setItem("user", JSON.stringify(guestUser));
    window.location.href = "/chat";
  };

  return (
      <div className={styles.container}>
        <div className={styles.left}>
          <img src="/logo.png" alt="로고" className={styles.logo} />
          <h1> 이야기하고, 공유하세요 — 지금, 마음의소리에서 </h1>
          <p>당신의 심리를 이해하며 공감해주는 챗봇을 통해 마음 속 이야기를 펼쳐보세요</p>
          <div className={styles.chatExample}>{currentExample}</div>
        </div>

        <div className={styles.right}>
          <div className={styles.loginBox}>
            <h2 className={styles.title}>다시 오신 걸 환영해요</h2>

            <div className={styles.inputGroup}>
              <label>이메일</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>👤</span>
                <input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>비밀번호</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>🔒</span>
                <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.forgotWrapper} style={{ textAlign: "center" }}>
              <button
                  onClick={() => router.push("/forgot-password")}
                  style={{ background: "none", border: "none", padding: 0, color: "#6c63ff", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
              >
                비밀번호 찾기
              </button>
              <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
              <button
                  className={styles.signupLink}
                  onClick={() => router.push("/signup")}
                  style={{ display: "inline", background: "none", border: "none", padding: 0 }}
              >
                회원가입
              </button>
            </div>

            <button className={styles.loginBtn} onClick={handleLogin}>
              로그인하기
            </button>

            <button className={styles.guestBtn} onClick={handleGuestLogin}>
              게스트 모드로 체험하기
            </button>

            <p className={styles.orText}>또는 다음으로 로그인하기</p>

            <div className={styles.socialButtons}>
              <button onClick={() => signIn("google", { callbackUrl: "/chat" })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#fbc02d" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C33.5 5.2 28.1 3 22 3 10.4 3 1 12.4 1 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.5-.4-3.5z" />
                  <path fill="#e53935" d="M6.3 14.7l6.6 4.8C14.3 16.1 17.9 14 22 14c3.1 0 5.9 1.2 8 3.1l6-6C33.5 5.2 28.1 3 22 3 14.2 3 7.4 7.5 6.3 14.7z" />
                  <path fill="#4caf50" d="M22 45c6.6 0 12.2-3.6 15.2-8.9l-7-5.4c-2 2.7-5.1 4.3-8.2 4.3-5.2 0-9.6-3.4-11.2-8.1l-6.9 5.3C7.6 40.8 14.3 45 22 45z" />
                  <path fill="#1565c0" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.3-5.5 6.9l7 5.4c.5-.5 8.2-6 8.2-16.8 0-1.2-.1-2.5-.4-3.5z" />
                </svg>
              </button>

              <button onClick={() => signIn("github", { callbackUrl: "/chat" })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black">
                  <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1 1 .1 1.4-.8 1.6-1.1.1-.7.4-1.1.7-1.3-2.5-.3-5.2-1.3-5.2-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.1 0 4.5-2.7 5.5-5.2 5.8.4.3.7.9.7 1.8v2.6c0 .3.2.7.8.6A11.6 11.6 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
