import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function EmailStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value) {
      setError("이메일 주소를 입력하세요.");
      return;
    }
    setError("");
    console.log("이메일:", value);
    onNext();
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
