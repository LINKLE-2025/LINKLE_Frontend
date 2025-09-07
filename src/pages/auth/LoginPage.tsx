import AuthFilledButton from "@/components/auth/AuthFilledButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthOutlinedButton from "@/components/auth/AuthOutlinedButton";
import axios from "axios";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // email, password 변경 시 콘솔에 출력
  useEffect(() => {
    console.log({ email, password });
  }, [email, password]);

  // 로그인 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("로그인 시도:", { email, password });

    // 로그인 처리 로직 (API 요청 등)
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      console.log("로그인 응답:", response.data);

      // 로그인 성공 시 처리
      if (response.data.success) {
        console.log("로그인 성공:", response.data);
        alert("로그인 성공!");
        // JWT 토큰 저장 (예: localStorage)
        localStorage.setItem("token", response.data.token);
        window.location.href = "/"; // 메인 페이지 이동
      } else {
        setPasswordError("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setPasswordError("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center mx-auto w-full max-w-[630px] px-6'>
      {/* 로고 */}
      <figure className='flex flex-col items-center mb-3'>
        <img
          src='/logos/linkle-icon.svg'
          alt='LINKLE 심볼'
          className='w-5/12 sm:w-7/12 max-w-[300px] h-auto'
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
        className='w-full max-w-sm flex flex-col items-center justify-center text-center gap-2'
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

      {/* 비밀번호 찾기 링크 */}
      <div className='text-base mb-7'>
        <a href='/forgot' className='font-semibold text-linkleGray hover:text-black'>
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
