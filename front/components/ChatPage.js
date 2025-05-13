import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow.jsx";
import styles from "@/styles/ChatPage.module.css";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [isNewChat, setIsNewChat] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [theme, setTheme] = useState("blue");
    const [newChatTrigger, setNewChatTrigger] = useState(0);
    const [selectedSessionId, setSelectedSessionId] = useState(id || null);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [refreshSessionList, setRefreshSessionList] = useState(false);

    // 클라이언트 사이드 초기화
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 사용자 정보 및 테마 설정
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

    // 세션 ID 관리
    useEffect(() => {
        if (!isClient) return;

        if (!id) {
            const newId = uuidv4();
            router.replace(`/chat/${newId}`);
        } else {
            setSelectedSessionId(id);
        }
    }, [isClient, id, router]);

    // 새 채팅 시작 핸들러
    const handleNewChat = () => {
        const newId = uuidv4();
        setSelectedSessionId(newId);
        setIsNewChat(true);
        setNewChatTrigger(prev => prev + 1);
        router.push(`/chat/${newId}`);
    };

    // 채팅 선택 핸들러
    const handleSelectChat = useCallback((sessionId) => {
        if (selectedSessionId === sessionId) return;
        setSelectedSessionId(sessionId);
        router.push(`/chat/${sessionId}`);
    }, [selectedSessionId, router]);

    if (!isClient || status === "loading" || !selectedSessionId) {
        return <div>Loading chat session...</div>;
    }

    return (
        <div className={`${styles.chatPage} ${styles[theme + "Theme"]}`}>
            <Sidebar
                isGuest={isGuest}
                onNewChat={handleNewChat}
                newChatTrigger={newChatTrigger}
                onSelectChat={handleSelectChat}
                theme={theme}
            />
            <ChatWindow
                isGuest={isGuest}
                newChatTrigger={newChatTrigger}
                selectedSessionId={selectedSessionId}
                theme={theme}
                isNewChat={isNewChat}              // ✅ 상태 기반으로 전달
                setIsNewChat={setIsNewChat}          // ✅ 추가
                setRefreshSessionList={setRefreshSessionList}  // ✅ 추가
            />
        </div>
    );
}