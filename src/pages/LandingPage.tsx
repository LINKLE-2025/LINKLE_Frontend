import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className='flex flex-col min-h-screen font-sans text-black'>
      {/* 시멘틱 Header */}
      <header className='flex items-center border-b border-gray-200 px-5 py-3'>
        <img src='/linkle-icon.svg' alt='LINKLE 로고' className='h-6 mr-2' />
        <h1 className='text-lg font-medium'>LINKLE</h1>
      </header>

      {/* 시멘틱 Main */}
      <main className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
        <figure className='flex flex-col items-center'>
          <img
            src='/linkle-icon.svg'
            alt='LINKLE 심볼'
            className='w-2/5 max-w-[400px] h-auto my-6 mt-[-40px]'
          />
          <figcaption className='sr-only'>서비스 대표 로고</figcaption>
        </figure>

        <h2 className='text-4xl md:text-5xl font-bold mb-4'>LINKLE</h2>
        <p className='text-gray-600 text-base md:text-lg leading-relaxed mb-6'>
          링커에 참여하고 친구들을 만나
          <br />
          다양한 추억을 남겨보세요.
        </p>

        <button className='bg-linkleGray hover:bg-black text-white font-bold py-3 px-8 rounded-full w-4/5 max-w-xs mb-6'>
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

      {/* 시멘틱 Footer */}
      <footer className='text-gray-400 text-xs py-4 text-center'>© TEAM CARDGARDEN</footer>
    </div>
  );
};

export default LandingPage;
