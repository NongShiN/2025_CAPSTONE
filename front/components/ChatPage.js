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
    const { id } = router.query; // ✅ URL에서 id 읽기

    const [isClient, setIsClient] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [theme, setTheme] = useState("blue");
    const [newChatTrigger, setNewChatTrigger] = useState(0);
    const [selectedSessionId, setSelectedSessionId] = useState(id || null);

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
        if (isClient && !id) {
            const newId = uuidv4();
            router.replace(`/chat/${newId}`); // URL에 새 ID 넣기
        } else if (isClient && id) {
            setSelectedSessionId(id);
            setNewChatTrigger((prev) => prev + 1);
        }
    }, [isClient, id, router]);

    const handleNewChat = () => {
        const newId = uuidv4();
        router.push(`/chat/${newId}`); // ✅ 새로운 대화 시작하면 URL 이동
    };

    if (!isClient || status === "loading" || !selectedSessionId) return <div>Loading chat session...</div>;

    return (
        <div className={`${styles.chatPage} ${styles[theme + "Theme"]}`}>
            <Sidebar
                isGuest={isGuest}
                onNewChat={handleNewChat}
                newChatTrigger={newChatTrigger}
                onSelectChat={(id) => router.push(`/chat/${id}`)} // ✅ 대화 선택 시 URL 이동
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