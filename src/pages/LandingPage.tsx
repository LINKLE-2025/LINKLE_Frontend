import PrimaryButton from "@/components/auth/AuthFilledButton";
import { useEffect } from "react";

export default function LandingPage() {
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
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-5'>
      {/* 로고 */}
      <figure className='flex flex-col items-center'>
        <img
          src='/logos/linkle-icon.svg'
          alt='LINKLE 심볼'
          className='w-1/2 max-w-[500px] h-auto'
        />
        <img
          src='/logos/logo_text.svg'
          alt='LINKLE 텍스트 로고'
          className='w-[45vw] max-w-[200px] h-auto my-5'
        />
        <figcaption className='sr-only'>LINKLE 로고</figcaption>
      </figure>

      {/* 소개 멘트 */}
      <p className='text-gray-600 text-base md:text-lg leading-relaxed mt-1 mb-5'>
        링커에 참여하고 친구들을 만나
        <br />
        다양한 추억을 남겨보세요.
      </p>

      {/* 앱 설치 버튼 */}
      <PrimaryButton className='mb-5'>LINKLE 앱 열기</PrimaryButton>

      {/* 로그인 및 회원가입 이동 버튼 */}
      <p className='text-base md:text-base mb-5'>
        <a href='/login' className='font-semibold text-linkleGray hover:text-black'>
          로그인
        </a>
        <span className='text-gray-400'> 또는 </span>
        <a href='/signup' className='font-semibold text-linkleGray hover:text-black'>
          가입하기
        </a>
      </p>
    </div>
  );
}
