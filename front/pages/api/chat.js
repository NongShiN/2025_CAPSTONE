const MODEL_API_URL = process.env.NEXT_PUBLIC_MODEL_API_URL;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { message } = req.body;

    try {
        const response = await fetch(`${MODEL_API_URL}/gen?user_input=${encodeURIComponent(message)}`);
        const data = await response.json();
        res.status(200).json({ message: data.response });
    } catch (error) {
        console.error("Model API error:", error);
        res.status(500).json({ message: "Error fetching model response" });
    }
}