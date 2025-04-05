export default function ChatMessage({ role, message }) {
    const isUser = role === 'user';
  
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && (
          <div className="mr-3 flex-shrink-0">
            <img src="/globe.svg" alt="bot" className="w-6 h-6 rounded-full" />
          </div>
        )}
        <div
        className={`
            px-4 py-3 max-w-[75%] text-sm whitespace-pre-line
            ${isUser ? 'bg-[#2E80F5] text-white rounded-xl rounded-br-none' : 'bg-[#1E1E1E] text-white rounded-xl rounded-bl-none'}
        `}
        style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: isUser ? 500 : 400,
            lineHeight: '1.75',
            fontSize: '14px'
        }}
        >
        {message}
        </div>
      </div>
    );
  }
  