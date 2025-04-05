import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';

export default function Home() {
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
