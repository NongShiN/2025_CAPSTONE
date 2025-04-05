import React, { useState } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const router = useRouter();

  // 입력값 상태 저장
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 로그인 버튼 클릭 시 처리
  const handleLogin = () => {
    // 예시용 로그인 검증 (나중엔 API로 변경 가능)
    if (email === "test@example.com" && password === "1234") {
      router.push("/chat"); // 로그인 성공 시 채팅 페이지로 이동
    } else {
      alert("로그인 정보가 올바르지 않습니다.");
    }
  };

  return (
      <div className="signup-container">
        {/* 왼쪽 소개 영역 */}
        <div className="left-section">
          <img src="/logo.png" alt="마음의 소리 로고" className="logo" />
          <h1>Learn, Discover &<br />Automate in One Place.</h1>
          <p className="left-subtext">Create a chatbot that understands you.</p>
          <div className="chat-example">💬 Chat interface example here</div>
        </div>

        {/* 오른쪽 로그인 폼 영역 */}
        <div className="right-section">
          <div className="form-box">
            <h2>Log in to 마음의 소리</h2>
            <p>Welcome back, please enter your details.</p>

            <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="submit-btn" onClick={handleLogin}>
              Log In
            </button>

            <p className="terms">
              By logging in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <p className="signup-msg">
              Don’t have an account? <a href="/signup">Sign up</a>
            </p>

            {/* 소셜 로그인 버튼 영역 */}
            <div className="divider">Or log in with…</div>

            <button className="social-btn google">
              Continue with Google
            </button>
            <button className="social-btn apple">
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;