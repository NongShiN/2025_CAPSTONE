import { useState } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="relative flex flex-col h-full px-4">
      {/* 메시지 출력 영역 */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-20">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm mt-4">Let me hear your heart</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-[#5A5DFF] text-white self-end ml-auto"
                  : "bg-gray-200 text-black self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* 입력창 (absolute로 겹치게 배치) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl z-10">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-lg">
          <img
            src="/sound_of_mind.svg"
            alt="Sound of Mind"
            className="w-6 h-6 mr-2"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            type="text"
            placeholder="Let me hear your heart"
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 -mt-0.5 border-none focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleSend}
            className="ml-1 mr-[-4px] bg-[#5A5DFF] w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#4e50e6] active:bg-[#3f41c8] p-0 shrink-0"
          >
            <img
              src="/send.svg"
              alt="Send"
              className="w-7 h-7 text-white invert"
            />
          </button>
        </div>
      </div>
      

    </div>
  );
}
