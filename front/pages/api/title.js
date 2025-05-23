// pages/api/title.js

import { OpenAI } from "openai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { content } = req.body;
    if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Invalid content" });
    }

    try {
        // 대화 분리: 한 줄씩 자르고, '🤖 상담사'로 시작하는 첫 줄을 제거
        const lines = content.trim().split("\n");

        // 첫 번째 챗봇 메시지 찾기
        const firstBotIndex = lines.findIndex(line => line.startsWith("🤖 상담사:"));
        const cleanedLines = firstBotIndex !== -1 ? lines.slice(firstBotIndex + 1) : lines;

        const cleanedContent = cleanedLines.join("\n");
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // GPT-3.5 Turbo는 messages 형식으로 대화 내용을 전달해야 합니다.
        const prompt = `
아래는 사용자와 심리상담사의 대화입니다.
대화에서 드러난 주요 고민, 감정, 상황을 바탕으로
구체적이고 직관적인 한글 제목을 10글자 정도로 지어주세요.

작성 조건:
\t•\t제목은 [상황/문제] + [감정/반응] 형식을 지향
\t•\t맥락이 드러나는 단어를 사용 (예: ‘시험불안’, ‘혼밥 외로움’)
\t•\t누구나 보자마자 대화 내용을 유추할 수 있도록
\t•\t불필요한 설명 없이 제목만 출력

${cleanedContent}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "너는 심리상담 대화의 핵심을 요약해 자연스러운 제목을 만드는 전문가야.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        // 응답에서 제목만 추출
        const title = response.choices[0].message.content.replace(/["'\n]/g, "").trim();

        return res.status(200).json({ title });
    } catch (err) {
        console.error("🔴 OpenAI 요청 실패:", err);
        return res.status(500).json({ error: "Failed to generate title" });
    }
}
