import { useState } from "react";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";

const Sidebar = () => {
  const [chats, setChats] = useState([
    "첫 번째 대화",
    "두 번째 대화",
    "세 번째 대화",
  ]);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      {/* 상단 버튼 */}
      <div className="flex justify-between mb-4">
        <button className="bg-blue-500 p-2 rounded"><FaPlus /></button>
        <button className="bg-gray-700 p-2 rounded"><FaSearch /></button>
      </div>

      {/* 대화 리스트 */}
      <ul className="flex-1 overflow-auto space-y-2">
        {chats.map((chat, index) => (
          <li key={index} className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-700">
            {chat}
          </li>
        ))}
      </ul>

      {/* 하단 버튼 */}
      <button className="bg-red-500 p-2 mt-4 rounded flex items-center justify-center">
        <FaTrash className="mr-2" /> 삭제
      </button>
    </div>
  );
};

export default Sidebar;
