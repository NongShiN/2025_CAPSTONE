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
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // GPT-3.5 Turbo는 messages 형식으로 대화 내용을 전달해야 합니다.
        const prompt = `
다음은 사용자와 상담사의 대화입니다.
이 대화의 핵심을 담은 짧고 자연스러운 제목을 만들어주세요.
형식은 오직 "제목"만 포함하고, 불필요한 설명은 제거해주세요.
${content}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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
