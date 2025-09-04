import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ChatRoom from "@/pages/chat/ChatRoom";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/chat/room/:roomId' element={<ChatRoom />} /> {/* ✅ 채팅 페이지 */}
        <Route path='/*' element={<App />} /> {/* 나머지는 기존 App */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
