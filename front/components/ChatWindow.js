import { useState } from "react";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.message };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white">
      <div className="flex-1 overflow-auto border border-gray-300 p-4 rounded">
        {messages.map((msg, idx) => (
          <p key={idx} className={msg.role === "user" ? "text-blue-500" : "text-gray-700"}>
            {msg.content}
          </p>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          placeholder="메시지 입력..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 rounded ml-2" onClick={sendMessage}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
