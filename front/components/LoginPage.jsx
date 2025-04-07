import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/LoginPage.module.css";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "test@example.com" && password === "1234") {
      const user = { email }; // 원하는 유저 정보
      localStorage.setItem("user", JSON.stringify(user)); // ✅ 저장
      router.push("/chat");
    } else {
      alert("로그인 정보가 올바르지 않습니다.");
    }
  };

  return (
      <div className={styles.container}>
        {/* 왼쪽 */}
        <div className={styles.left}>
          <img src="/logo.png" alt="로고" className={styles.logo} />
          <h1>Learn, Discover & Automate in One Place.</h1>
          <p>Create a chatbot that understands you.</p>
          <div className={styles.chatExample}>💬 Chat interface example here</div>
        </div>

        {/* 오른쪽 */}
        <div className={styles.right}>
          <div className={styles.formBox}>
            <h2>Log in to 마음의 소리</h2>
            <p>Welcome back, please enter your details.</p>

            <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
            />

            <button className={styles.submitBtn} onClick={handleLogin}>
              Log In
            </button>

            <p className={styles.terms}>
              By logging in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <p className={styles.signupMsg}>
              Don’t have an account? <a href="/signup">Sign up</a>
            </p>

            <div className={styles.divider}>Or log in with…</div>

            <button onClick={() => signIn("google", { callbackUrl: "/chat" })}>
              Continue with Google
            </button>

            <button onClick={() => signIn("github", { callbackUrl: "/chat" })}>
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;