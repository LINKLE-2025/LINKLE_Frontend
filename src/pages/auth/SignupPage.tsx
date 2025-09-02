import JoinFooter from "@/components/footer/JoinFooter";
import MainHeader from "@/components/header/MainHeader";
import React from "react";

function SignUpPage() {
  return (
    <div className='flex flex-col min-h-screen text-black'>
      {/* Header */}
      <MainHeader />

      <main className='flex flex-1 flex-col items-center justify-center px-6 text-center mb-10'>
        회원가입
      </main>

      {/* Footer */}
      <JoinFooter />
    </div>
  );
}

export default SignUpPage;
