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
      const user = { email };
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/chat";
    } else {
      alert("로그인 정보가 올바르지 않습니다.");
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
          <h1>Learn, Discover & Automate in One Place.</h1>
          <p>Create a chatbot that understands you.</p>
          <div className={styles.chatExample}>💬 Chat interface example here</div>
        </div>

        <div className={styles.right}>
          <div className={styles.loginBox}>
            <h2 className={styles.title}>Login</h2>

            <div className={styles.inputGroup}>
              <label>Username</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>👤</span>
                <input
                    type="email"
                    placeholder="Type your username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>🔒</span>
                <input
                    type="password"
                    placeholder="Type your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.forgotWrapper} style={{ textAlign: "center" }}>
              <a href="#">Forgot password?</a>
              <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
              <button
                  className={styles.signupLink}
                  onClick={() => router.push("/signup")}
                  style={{ display: "inline", background: "none", border: "none", padding: 0 }}
              >
                Sign up
              </button>
            </div>

            <button className={styles.loginBtn} onClick={handleLogin}>
              LOGIN
            </button>

            <button className={styles.guestBtn} onClick={handleGuestLogin}>
              Continue as Guest
            </button>

            <p className={styles.orText}>Or continue with</p>

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
