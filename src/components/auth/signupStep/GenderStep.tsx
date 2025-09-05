import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function GenderStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value) {
      setError("성별을 선택하세요.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 성별 선택 */}
      <div className='flex gap-4'>
        <label>
          <AuthInput
            type='radio'
            name='gender'
            value='남성'
            onChange={(e) => {
              onChange(e.target.value);
              if (error) setError("");
            }}
          />
          남성
        </label>
        <label>
          <AuthInput
            type='radio'
            name='gender'
            value='여성'
            onChange={(e) => {
              onChange(e.target.value);
              if (error) setError("");
            }}
          />
          여성
        </label>
      </div>

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5 sm:mb-7' onClick={handleNext}>
        다음
      </AuthFilledButton>
    </div>
  );
}
