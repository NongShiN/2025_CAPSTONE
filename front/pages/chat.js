import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바는 흰색 카드 스타일로 유지 */}
      <div className="p-4">
        <Sidebar />
      </div>

      {/* 채팅창 영역 */}
      <main className="flex-1 p-4">
        <ChatWindow />
      </main>
    </div>
  );
}
