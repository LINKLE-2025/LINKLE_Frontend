import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function NicknameStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value) {
      setError("닉네임을 입력하세요.");
      return;
    }
    // TODO: 닉네임 형식 검증 추가 가능
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 닉네임 입력 */}
      <AuthInput
        type='text'
        placeholder='닉네임'
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
