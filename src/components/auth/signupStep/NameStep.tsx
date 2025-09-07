import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function NameStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const nameRegex = /^[0-9a-zA-Z가-힣\s]+$/;

  const handleNext = () => {
    // 이름 유효성 검사
    if (!value) {
      setError("이름을 입력하세요.");
      return;
    }
    // 이름 형식 검사 (한글, 영문 대소문자, 공백 허용)
    if (!nameRegex.test(value)) {
      setError("유효하지 않은 이름 형식입니다.");
      return;
    }
    // 유효성 검사 통과
    console.log("이름:", value);
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 이름 입력 */}
      <AuthInput
        type='text'
        placeholder='이름'
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
