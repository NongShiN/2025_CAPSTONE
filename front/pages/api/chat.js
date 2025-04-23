export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { message } = req.body;

    try {
        // ✅ 여기를 OpenAI → 너의 모델 서버로 변경
        const response = await fetch(`https://model-server-281506025529.asia-northeast3.run.app/gen?user_input=${encodeURIComponent(message)}`);
        const data = await response.json();

        res.status(200).json({ message: data.response });
    } catch (error) {
        console.error("Model API error:", error);
        res.status(500).json({ message: "Error fetching model response" });
    }
}