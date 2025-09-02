import JoinFooter from "@/components/footer/JoinFooter";
import MainHeader from "@/components/header/MainHeader";
import React, { useEffect } from "react";

const LandingPage: React.FC = () => {
  useEffect(() => {
    fetch("/api/test")
      .then((res) => {
        if (!res.ok) throw new Error("API 실패");
        return res.json();
      })
      .then((data) => console.log("API 응답:", data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className='flex flex-col min-h-screen text-black'>
      {/* Header */}
      <MainHeader />

      {/* Main */}
      <main className='flex flex-1 flex-col items-center justify-center px-6 text-center mb-10'>
        <figure className='flex flex-col items-center'>
          <img
            src='/logos/linkle-icon.svg'
            alt='LINKLE 심볼'
            className='w-1/2 max-w-[400px] h-auto'
          />
          <figcaption className='sr-only'>서비스 대표 로고</figcaption>
        </figure>
        <figure className='flex flex-col items-center'>
          <img
            src='/logos/logo_text.svg'
            alt='LINKLE 텍스트 로고'
            className='w-[45vw] max-w-[200px] h-auto my-5'
          />
          <figcaption className='sr-only'>서비스 텍스트 로고</figcaption>
        </figure>
        <p className='text-gray-600 text-base md:text-lg leading-relaxed mt-1 mb-5'>
          링커에 참여하고 친구들을 만나
          <br />
          다양한 추억을 남겨보세요.
        </p>

        <button className='bg-linkleGray hover:bg-black text-white font-bold py-2.5 px-8 rounded-full w-full max-w-xs mb-5'>
          LINKLE 앱 열기
        </button>

        <p className='text-sm md:text-base'>
          <a href='/login' className='font-semibold text-linkleGray hover:text-black'>
            로그인
          </a>{" "}
          <span className='text-gray-400'>또는</span>{" "}
          <a href='/signup' className='font-semibold text-linkleGray hover:text-black'>
            가입하기
          </a>
        </p>
      </main>

      {/* Footer */}
      <JoinFooter />
    </div>
  );
};

export default LandingPage;
