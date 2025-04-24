// pages/community.js
import dynamic from "next/dynamic";
const CommunityPage = dynamic(() => import("@/components/CommunityPage"), { ssr: false });

export default function Community() {
    return <CommunityPage />;
}
