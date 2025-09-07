import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function PasswordStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/; // 6자 이상, 영문 대소문자, 숫자, 특수문자 포함

  const handleNext = () => {
    // 비밀번호 유효성 검사
    if (!value) {
      setError("비밀번호를 입력하세요.");
      return;
    }
    // 비밀번호 길이 검사
    if (passwordRegex.test(value) === false) {
      setError("유효하지 않은 비밀번호 형식입니다.");
      return;
    }
    // 유효성 검사 통과
    console.log("비밀번호:", value);
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 비밀번호 입력 */}
      <AuthInput
        type='password'
        placeholder='비밀번호'
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
