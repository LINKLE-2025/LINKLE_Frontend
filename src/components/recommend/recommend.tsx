import axios from "axios";
import { useEffect } from "react";

export default function TestAPI() {
    useEffect(() => {
        axios.get("https://localhost/recommend?user_id=2", {
            withCredentials: true, // 쿠키가 필요하면 true
        })
            .then(res => console.log("✅ 연결 성공:", res.data))
            .catch(err => console.error("❌ 에러:", err));
    }, []);

    return <div>API 테스트 중...</div>;
}
