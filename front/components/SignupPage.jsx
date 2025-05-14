import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from '../styles/SignupPage.module.css';
import { motion } from 'framer-motion';
import URLS from '../config';

const SignupPage = () => {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

     //handleSinup 수정
     const handleSignup = async (e) => {
      e.preventDefault();
    
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${URLS.BACK}`;
        const res = await fetch(`${apiUrl}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: name,
            email: email,
            password: password 
          })
        });
    
        const data = await res.json().catch(() => ({ message: 'Signup failed' }));
    
        if (!res.ok) {
          alert(data.message || 'Signup failed'); 
          return;
        }
    
        alert("Welcome, " + name + "! 🎉");
        router.push("/chat");
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    

    return (
        <div className={styles.container}>
            {/* 왼쪽 브랜드 섹션 */}
            <div className={styles.left}>
                <img src="/logo.png" className={styles.logo} />
                <h1>Join the Movement 💫</h1>
                <p className={styles.subtext}>Create your account and start building!</p>
            </div>

            {/* 오른쪽 회원가입 폼 */}
            <div className={styles.right}>
                <motion.div className={styles.signupCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                >
                    <h1>Join 마음의 소리</h1>
                    <p>Create your free account and start exploring today.</p>

                    {/* 입력 필드 그룹 */}
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button className={styles.signupBtn} onClick={handleSignup}>
                        Sign Up
                    </button>

                    <p className={styles.loginLink}>
                        Already have an account? <a href="/login">Log in</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
