import AuthFilledButton from "@/components/auth/AuthFilledButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthOutlinedButton from "@/components/auth/AuthOutlinedButton";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 처리 로직 (API 요청 등)
    console.log("로그인 시도:", { email, password });
  };

  return (
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-6'>
      {/* 로고 */}
      <figure className='flex flex-col items-center mb-3'>
        <img
          src='/logos/linkle-icon.svg'
          alt='LINKLE 심볼'
          className='w-5/12 sm:w-3/4 max-w-[300px] h-auto'
        />
        <img
          src='/logos/logo_text.svg'
          alt='LINKLE 텍스트 로고'
          className='w-[35vw] sm:w-[25vw] max-w-[180px] h-auto mt-4 mb-6'
        />
        <figcaption className='sr-only'>LINKLE 로고</figcaption>
      </figure>

      {/* 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm flex flex-col items-center justify-center text-center gap-4'
      >
        <AuthInput
          type='email'
          placeholder='이메일 주소'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          error={emailError}
        />

        <AuthInput
          type='password'
          placeholder='비밀번호'
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError("");
          }}
          error={passwordError}
        />

        <AuthFilledButton type='submit' className='mt-2 mb-5'>
          로그인
        </AuthFilledButton>
      </form>

      {/* 부가 링크 */}
      <div className='text-base mb-7'>
        <a href='/forgot' className='font-semibold text-gray-700 hover:text-black'>
          비밀번호를 잊으셨나요?
        </a>
      </div>

      {/* 계정 만들기 버튼 */}
      <a href='/signup' className='w-full max-w-sm'>
        <AuthOutlinedButton>새 계정 만들기</AuthOutlinedButton>
      </a>
    </div>
  );
}
