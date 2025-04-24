import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow.jsx";
import styles from "@/styles/ChatPage.module.css";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [theme, setTheme] = useState("blue");
    const [newChatTrigger, setNewChatTrigger] = useState(0);
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || status === "loading") return;

        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser) {
            const userTheme = storedUser.guest ? "blue" : storedUser.theme || "blue";
            setIsGuest(!!storedUser.guest);
            setTheme(userTheme);
        } else if (status === "authenticated" && session?.user?.email) {
            const newUser = { email: session.user.email };
            localStorage.setItem("user", JSON.stringify(newUser));
            setIsGuest(false);
            setTheme("blue");
        } else {
            router.replace("/login");
        }
    }, [isClient, session, status, router]);

    useEffect(() => {
        // ✅ 진입 시 무조건 세션 자동 생성
        if (isClient && !selectedSessionId) {
            const newId = uuidv4();
            setSelectedSessionId(newId);
            setNewChatTrigger((prev) => prev + 1);
        }
    }, [isClient, selectedSessionId]);

    const handleNewChat = () => {
        const newId = uuidv4();
        setSelectedSessionId(newId);
        setNewChatTrigger((prev) => prev + 1);
    };

    if (!isClient || status === "loading" || !selectedSessionId) return <div>Loading chat session...</div>;

    return (
        <div className={`${styles.chatPage} ${styles[theme + "Theme"]}`}>
            <Sidebar
                isGuest={isGuest}
                onNewChat={handleNewChat}
                newChatTrigger={newChatTrigger}
                onSelectChat={(id) => setSelectedSessionId(id)}
            />
            <ChatWindow
                isGuest={isGuest}
                newChatTrigger={newChatTrigger}
                selectedSessionId={selectedSessionId}
                theme={theme}
            />
        </div>
    );
}