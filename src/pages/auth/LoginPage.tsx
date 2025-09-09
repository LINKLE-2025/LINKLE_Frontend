import { getCurrentUserId, getCurrentUserInfo, login } from "@/api/authApi";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthOutlinedButton from "@/components/auth/AuthOutlinedButton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // email, password 변경 시 콘솔에 출력
  useEffect(() => {
    console.log({ email, password });
  }, [email, password]);

  // 로그인 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("로그인 시도:", { email, password });
    // 유효성 검사
    if (!email && !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setError("");

    // 로그인 처리 로직 (API 요청 등)
    try {
      const responseData = await login(email, password);
      console.log("로그인 응답:", responseData);

      // 로그인 성공 시 처리
      if (responseData.success) {
        // JWT 토큰 저장 (예: localStorage)
        localStorage.setItem("token", responseData.token);
        console.log("로그인 성공:", responseData);
        // alert("로그인 성공!");
        // 현재 로그인한 사용자 정보 조회
        const loginUserData = await getCurrentUserInfo();
        console.log("현재 로그인한 사용자 정보:", loginUserData);
        // alert("로그인 유저 정보: " + JSON.stringify(loginUserData));
        window.location.href = "/"; // 메인 페이지 이동
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (e) {
      console.error("로그인 오류:", e);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  // 각종 테스트 버튼 클릭 처리 함수
  // const handleTestClick = async () => {
  //   console.log("각종 테스트 버튼 클릭됨");
  //   // 현재 로그인한 사용자 정보 조회
  //   try {
  //     const loginUserId = await getCurrentUserId();
  //     console.log("현재 로그인한 사용자 ID:", loginUserId);
  //     alert("로그인 유저 ID: " + loginUserId);
  //   } catch (e: any) {
  //     console.error("사용자 정보 조회 오류:", e.response?.data.message || e);
  //     alert(e.response?.data.message || e);
  //   }
  // };

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

      {/* 테스트 버튼 */}
      {/* <AuthFilledButton type='button'
        className='mt-2 mb-5'
        onClick={handleTestClick}>
        각종 테스트
      </AuthFilledButton> */}

      {/* 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm flex flex-col items-center justify-center text-center gap-2'
      >
        <AuthInput
          type='text'
          placeholder='이메일 주소'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <AuthInput
          type='password'
          placeholder='비밀번호'
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        {/* 에러 메시지 */}
        <div className='text-center'>
          {error && <p className='text-sm font-medium text-red-500'>{error}</p>}
        </div>

        <AuthFilledButton type='submit' className='mt-2 mb-5'>
          로그인
        </AuthFilledButton>
      </form>

      {/* 비밀번호 찾기 링크 */}
      <div className='text-base mb-7'>
        <Link to='/forgot-password' className='font-semibold text-linkleGray hover:text-black'>
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {/* 계정 만들기 버튼 */}
      <Link to='/signup' className='w-full max-w-sm'>
        <AuthOutlinedButton>새 계정 만들기</AuthOutlinedButton>
      </Link>
    </div>
  );
}
