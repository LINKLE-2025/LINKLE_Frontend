import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import axios from "axios";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function EmailStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNext = async () => {
    // 이메일 유효성 검사
    if (!value) {
      setError("이메일 주소를 입력하세요.");
      return;
    }

    // 이메일 형식 검사
    if (!emailRegex.test(value)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    // 중복 검사 통과
    setError("");
    console.log("이메일:", value);

    // 서버에 이메일 중복 체크 요청
    const isEmailAvailable = await checkEmailOnServer(value);
    if (!isEmailAvailable) return;

    // 인증 코드 자동 발송 및 다음 단계로 이동
    sendVerificationCode(value);
    console.log("이메일 사용 가능, 다음 단계로 이동");
    onNext();
  };

  // 이메일 중복 검사 및 인증 코드 발송 요청
  const checkEmailOnServer = async (email: string) => {
    try {
      const response = await axios.get(`/api/auth/email/${encodeURIComponent(email)}`);
      console.log("이메일 사용 가능 여부: " + response.data.available);
      if (response.data.available) {
        return true;
      }
      setError("이미 사용 중인 이메일입니다.");
      return false;
    } catch (error) {
      console.error("이메일 중복 검사 오류: ", error);
      setError("서버와 통신 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 서버에 인증 코드 발송 요청
  const sendVerificationCode = async (email: string) => {
    try {
      await axios.post(`/api/auth/email/${encodeURIComponent(email)}`);
      console.log("인증 코드가 이메일로 발송되었습니다.");
      return true;
    } catch (error) {
      console.error("인증 코드 발송 오류: ", error);
      setError("서버와 통신 중 오류가 발생했습니다.");
      return false;
    }
  };

  return (
    <div>
      {/* 이메일 입력 */}
      <AuthInput
        type='email'
        placeholder='이메일 주소'
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (error) setError("");
        }}
        error={error}
      />

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
