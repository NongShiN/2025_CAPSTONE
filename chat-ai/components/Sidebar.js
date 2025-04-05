export default function Sidebar() {
  return (
    <div className="w-64 bg-[#121212] text-white h-full border-r border-gray-700 p-4 hidden md:block">
      <div className="space-y-4">
        <button className="w-full text-left p-2 hover:bg-[#2A2A2A] rounded">+ New Chat</button>
        <div className="text-sm text-gray-400 mt-6">History</div>
        <ul className="space-y-2">
          <li className="hover:bg-[#2A2A2A] p-2 rounded">Chat 1</li>
          <li className="hover:bg-[#2A2A2A] p-2 rounded">Chat 2</li>
        </ul>
      </div>
    </div>
  );
}
