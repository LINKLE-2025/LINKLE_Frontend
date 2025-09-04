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

  const handleNext = () => {
    if (!value) {
      setError("이름을 입력하세요.");
      return;
    }
    // TODO: 이름 형식 검증 추가 가능
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
