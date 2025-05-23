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
                <h1>마음의 변화에 함께하세요 💫</h1>
                <p className={styles.subtext}>계정을 생성하여 내면의 소리를 들려주세요</p>
            </div>

            {/* 오른쪽 회원가입 폼 */}
            <div className={styles.right}>
                <motion.div className={styles.signupCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                >
                    <h1>마음의 소리에 가입하세요</h1>
                    <p>계정을 만들고 마음의 소리에 귀기울여 보세요</p>

                    {/* 입력 필드 그룹 */}
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="비밀번호 재입력"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button className={styles.signupBtn} onClick={handleSignup}>
                        회원가입하기
                    </button>

                    <p className={styles.loginLink}>
                        이미 계정이 있으신가요? <a href="/login">로그인 화면으로</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
