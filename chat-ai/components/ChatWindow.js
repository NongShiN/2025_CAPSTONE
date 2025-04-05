import { useState } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'bot', message: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#101010] text-white">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} role={m.role} message={m.message} />
        ))}
      </div>
    </div>
  );
}
