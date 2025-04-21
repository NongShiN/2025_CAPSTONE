import React, { useState } from "react";
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
                    <h2 className={styles.title}>Reset Password</h2>

                    <p style={{ textAlign: "center", fontSize: "14px", marginBottom: "16px" }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.icon}>📧</span>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button className={styles.loginBtn} type="submit">
                            Send Reset Link
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
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;