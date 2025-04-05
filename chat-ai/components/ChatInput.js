import { useState } from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons'; // 아이콘 라이브러리도 가능

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="w-full px-6 py-4 bg-[#1E1E1E] border-t border-gray-700">
      <div className="flex items-center bg-[#2A2A2A] rounded-2xl px-4 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message Chat AI..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="text-white p-2 rounded-full hover:bg-[#3A3A3A] transition"
        >
          <PaperPlaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
