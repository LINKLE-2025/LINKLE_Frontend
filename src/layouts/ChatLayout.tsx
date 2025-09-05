// layouts/ChatLayout.tsx
import MainFooter from "@/components/footer/MainFooter";
import MainHeader from "@/components/header/MainHeader";
import { Outlet } from "react-router-dom";

export default function ChatLayout() {
  return (
    <div className='flex flex-col min-h-[100dvh] text-black'>
      <MainHeader />

      <main className='flex-1 flex flex-col items-center justify-center text-center'>
        <Outlet />
      </main>

      <MainFooter />
    </div>
  );
}
