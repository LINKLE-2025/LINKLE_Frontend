import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";

type Props = {
  onNext: () => void;
  onPrev: () => void;
};

export default function EmailStep({ onNext }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!email) {
      setError("이메일 주소를 입력하세요.");
      return;
    }
    // TODO: 이메일 형식 검증 추가 가능
    setError("");
    onNext();
  };

  return (
    <div>
      {/* 안내 문구 */}
      <div className='text-left'>
        <h2 className='text-3xl font-bold mt-6 mb-3'>이메일 주소 입력</h2>
        <p className='text-linkleGray text-sm mb-3'>
          회원님에게 연락할 수 있는 이메일 주소를 입력하세요. 이 이메일 주소는 프로필에서 다른
          사람에게 공개되지 않습니다.
        </p>
      </div>

      {/* 이메일 입력 */}
      <AuthInput
        type='email'
        placeholder='이메일 주소'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='my-5' onClick={handleNext}>
        다음
      </AuthFilledButton>

      {/* 로그인 이동 링크 */}
      <div className='text-base'>
        <a href='/login' className='font-bold text-linkleGray hover:text-black'>
          이미 계정이 있습니다
        </a>
      </div>
    </div>
  );
}
