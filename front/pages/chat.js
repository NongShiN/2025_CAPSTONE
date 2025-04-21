import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            router.push("/login");
        } else {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className={styles.chatPage}>
            <Sidebar />
            <ChatWindow />
        </div>
    );
}