import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/ProfilePage.module.css";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [nickname, setNickname] = useState("");
    const [theme, setTheme] = useState("blue");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser) {
            router.push("/login");
        } else {
            setUser(storedUser);
            setNickname(storedUser.nickname || "Andrew Neilson");
            setTheme(storedUser.theme || "blue");
        }
    }, []);

    const handleSave = () => {
        const updatedUser = { ...user, nickname, theme };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Profile updated!");
    };

    if (!user) return null;

    return (
        <div className={`${styles.pageWrapper} ${styles[theme]}`}>
            <div className={styles.profileCard}>
                <img src="/file.svg" alt="User" className={styles.avatar} />
                <h2>{user.email}</h2>

                <label className={styles.label}>Nickname</label>
                <input
                    className={styles.input}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />

                <label className={styles.label}>Theme</label>
                <select
                    className={styles.select}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                </select>

                <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                <button className={styles.backBtn} onClick={() => router.back()}>← Back</button>
            </div>
        </div>
    );
}
