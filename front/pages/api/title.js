// pages/api/title.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { content } = req.body;

    if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Invalid content" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
다음은 사용자와 상담사의 대화입니다.
이 대화의 핵심을 담은 짧고 자연스러운 제목을 만들어주세요.
형식은 오직 "제목"만 포함하고, 불필요한 설명은 제거해주세요.

${content}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const title = text.replace(/["'\n]/g, "").trim();

        return res.status(200).json({ title });
    } catch (err) {
        console.error("🔴 Gemini 요청 실패:", err);
        return res.status(500).json({ error: "Failed to generate title" });
    }
}