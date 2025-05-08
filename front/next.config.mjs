/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    reactStrictMode: true,
    swcMinify: true,
};

export default nextConfig;