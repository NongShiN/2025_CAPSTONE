import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();

  const handleNewChat = () => {
    console.log("New chat created");
  };

  const handleSearch = () => {
    console.log("Search clicked");
  };

  return (
    <aside className="w-64 h-full bg-white rounded-3xl shadow-xl p-6 flex flex-col justify-between text-black">
      {/* 상단 로고 + New Chat */}
      <div>
        {/* 로고 영역 */}
        <div
          onClick={() => window.location.reload()}
          className="text-2xl font-black tracking-wide mb-6 cursor-pointer"
        >
          Sound of Mind
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleNewChat}
            className="flex-1 bg-[#5A5DFF] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#4e50e6] active:bg-[#3f41c8] transition"
          >
            + New chat
          </button>
          <button
            onClick={handleSearch}
            className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 active:bg-gray-700 transition"
          >
            <img src="/Magnifying_Glass.svg" alt="Search" className="w-4 h-4" />
          </button>
        </div>

        {/* 대화 목록 */}
        <div className="border-t border-gray-200 mb-2" />
        <div className="flex justify-between text-gray-500 text-xs px-1 mb-2">
          <span>Your conversations</span>
          <button className="text-[#5A5DFF] hover:underline">Clear All</button>
        </div>
        <div className="border-b border-gray-200 mb-3" />

        <ul className="space-y-2">
          {["Create Html Game Environment…", "Apply To Leave For Emergency", "What Is UI UX Design?"].map(
            (title, index) => (
              <li
                key={index}
                className="flex items-center gap-2 hover:bg-[#f0f0f0] px-3 py-2 rounded-xl cursor-pointer"
              >
                <img src="/message.svg" alt="chat icon" className="w-4 h-4" />
                {title}
              </li>
            )
          )}
        </ul>
      </div>

      {/* 하단 */}
      <div className="space-y-3">
        <button className="w-full flex items-center gap-2 border px-4 py-2 rounded-full text-sm hover:bg-gray-100">
          <img src="/setting.svg" alt="Settings" className="w-5 h-5" />
          Settings
        </button>
        <button className="w-full flex items-center gap-2 border px-4 py-2 rounded-full text-sm hover:bg-gray-100">
          <img src="/file.svg" alt="avatar" className="w-6 h-6 rounded-full" />
          Andrew Neilson
        </button>
      </div>
    </aside>
  );
}
