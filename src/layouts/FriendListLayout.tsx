import MainFooter from "@/components/footer/MainFooter";
import MainHeader from "@/components/header/MainHeader";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FriendLayout() {
  const loggedInUserId = 466;
  return (
    <div className='flex flex-col min-h-[100dvh] text-black'>
      <main
        className='flex-col items-center justify-center text-center'
      >
        <Outlet context={{ loggedInUserId }} />
      </main>
      <MainFooter />
    </div>
  );
}
