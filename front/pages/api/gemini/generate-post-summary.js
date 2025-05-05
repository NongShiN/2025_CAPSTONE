export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { messages } = req.body;
        const chatText = messages.map(m =>
            `${m.sender === 'user' ? '🙋 사용자' : '🤖 상담사'}: ${m.text}`
        ).join('\n');

        const prompt = `
다음은 상담 대화입니다:

${chatText}

다음은 사용자(🙋)와 챗봇(🤖)의 상담 대화입니다.  
이 대화를 기반으로, 커뮤니티에 올릴 수 있도록 다음 내용을 작성해주세요:

1. **제목**: 상담 경험을 간결하고 진심 있게 표현한 한 줄 제목 (예: "감정을 말로 꺼내는 게 이렇게 어려운 줄 몰랐어요")
2. **본문**: 사용자가 1인칭 시점으로 쓴 것처럼, 상담 대화에서 느낀 감정과 경험을 자연스럽게 서술해주세요.
   - 문체는 부드러운 구어체이며, 분석적 표현은 피해주세요.  
   - 감정을 솔직하게 드러내되, 부담스럽지 않게 공감 가는 어조로 작성해주세요.
   - 문단을 나눠 가독성을 높여주세요.
3. **태그**: 다음 중 하나만 선택해주세요 — \`["우울", "불안", "자존감", "대인관계", "진로", "기타"]\`

**결과는 아래 형식의 정확한 JSON 형태로 출력해주세요 (백틱 없이):**

\`\`\`json
{
  "title": "제목",
  "summary": "본문 (사용자 시점)",
  "tag": "태그"
}
`;

        console.log("📤 Gemini 프롬프트:", prompt); // 확인용

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gemini HTTP 오류:", response.status, errorText);
            return res.status(500).json({ error: "Gemini 호출 실패" });
        }

        const result = await response.json();
        console.log("📥 Gemini 응답:", result);


        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

// 백틱 제거
        const cleanedText = text.replace(/```json|```/g, "").trim();

        try {
            const parsed = JSON.parse(cleanedText);
            return res.status(200).json(parsed);
        } catch (error) {
            console.error("❌ JSON 파싱 실패:", cleanedText);
            return res.status(500).json({ error: "응답 파싱 실패", raw: cleanedText });
        }
    } catch (error) {
        console.error("❌ Gemini API 처리 중 오류:", error);
        return res.status(500).json({ error: 'Gemini 호출 중 오류 발생' });
    }
}