// openai 라이브러리 설치 필요: npm install openai
import { OpenAI } from "openai";

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
3. **태그**: 다음 중 하나만 선택해주세요 - \`["우울", "불안", "자존감", "대인관계", "진로", "기타"]\`
**결과는 아래 형식의 정확한 JSON 형태로 출력해주세요 (백틱 없이):**
\`\`\`json
"title": "제목",
"summary": "본문 (사용자 시점)",
"tag": "태그"
`;

        // OpenAI API 호출
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // 또는 gpt-3.5-turbo 등 원하는 모델
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const text = completion.choices[0]?.message?.content || "";
        // 백틱 및 코드블록 제거
        const cleanedText = text.replace(/``````/g, "").trim();

        try {
            const parsed = JSON.parse(cleanedText);
            return res.status(200).json(parsed);
        } catch (error) {
            console.error("❌ JSON 파싱 실패:", cleanedText);
            return res.status(500).json({ error: "응답 파싱 실패", raw: cleanedText });
        }
    } catch (error) {
        console.error("❌ OpenAI API 처리 중 오류:", error);
        return res.status(500).json({ error: 'OpenAI 호출 중 오류 발생' });
    }
}
