import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import styles from "@/styles/ChatPage.module.css";

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

    if (!isClient || status === "loading") return <div>Loading...</div>;

    return (
        <div className={`${styles.chatPage} ${styles[theme + "Theme"]}`}>
            <Sidebar
                isGuest={isGuest}
                onNewChat={() => setNewChatTrigger((prev) => prev + 1)}
                newChatTrigger={newChatTrigger} // ✅ 추가됨
                onSelectChat={(id) => setSelectedSessionId(id)}
            />
            <ChatWindow
                isGuest={isGuest}
                newChatTrigger={newChatTrigger}
                selectedSessionId={selectedSessionId}
            />
        </div>
    );
}
