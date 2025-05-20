import URLS from '../../config';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    console.log("URL:", URLS);
    console.log(`Request Body: ${req.body}`);

    const {
        user_info: { user_id },
        query: { user_input }
    } = req.body;


    
    console.log(`user_id: ${user_id}, user_input: ${user_input}`);

    try {
        console.log("✅ MODEL URL:", URLS.MODEL);
        // ✅ 여기를 OpenAI → 너의 모델 서버로 변경
        const response = await fetch(`${URLS.MODEL}/gen`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_info: {
                    user_id: user_id,
                },
                query: {
                    user_input: user_input
                }
            })
        });
        const output = await response.json();
        console.log("🎯 모델 응답 결과:", output); // ✅ 여기에 로그 추가
        res.status(200).json({ output: output });
    } catch (error) {
        console.error("Model API error:", error);
        res.status(500).json({ message: "Error fetching model response" });
    }
}
