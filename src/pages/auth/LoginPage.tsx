import JoinFooter from "@/components/footer/JoinFooter";
import MainHeader from "@/components/header/MainHeader";
import React from "react";

function LoginPage() {
  return (
    <div className='flex flex-col min-h-screen text-black'>
      {/* Header */}
      <MainHeader />

      <main className='flex flex-1 flex-col items-center justify-center px-6 text-center mb-10'>
        로그인
      </main>

      {/* Footer */}
      <JoinFooter />
    </div>
  );
}

export default LoginPage;
