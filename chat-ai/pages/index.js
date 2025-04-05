import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 실제 인증 여부로 대체

  useEffect(() => {
    const token = localStorage.getItem('token'); // 예: JWT 토큰
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <ChatWindow />
        <ChatInput onSend={(msg) => console.log('Send:', msg)} />
      </div>
    </div>
  );
}