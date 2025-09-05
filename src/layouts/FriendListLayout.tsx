import MainFooter from "@/components/footer/MainFooter";
import MainHeader from "@/components/header/MainHeader";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FriendLayout() {
  return (
    <div className='flex flex-col min-h-[100dvh] text-black'>
      <main 
        className='flex-col items-center justify-center text-center'
        >
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
}
