import { useEffect, useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import { checkEmail, sendEmailCode } from "@/api/authApi";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  forgot?: boolean;
};

export default function EmailStep({ value, onChange, onNext, forgot = false }: Props) {
  const [error, setError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [value]);

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

    // 형식 검사 통과
    setError("");
    console.log("이메일:", value);

    // 서버에 이메일 중복 체크 요청
    const isEmailExists = await checkEmailOnServer(value);
    // 비밀번호 재설정 시 가입되지 않은 이메일일 경우 오류
    if (forgot && !isEmailExists) {
      setError("가입되지 않은 이메일입니다.");
      return;
    }
    if (!forgot && isEmailExists) {
      setError("이미 사용 중인 이메일입니다.");
      return;
    }

    // 인증 코드 자동 발송 및 다음 단계로 이동
    sendEmailCodeOnServer(value);
    console.log("이메일 확인 완료, 다음 단계로 이동");
    onNext();
  };

  // 이메일 중복 검사 요청
  const checkEmailOnServer = async (email: string) => {
    try {
      const { exists } = await checkEmail(email);
      console.log("이메일 중복 검사 결과: " + exists);
      if (exists) {
        console.log("이메일 사용 중");
        return true;
      }
      console.log("가입되지 않은 이메일");
      return false;
    } catch (error) {
      console.error("이메일 중복 검사 오류: ", error);
      setError("서버와 통신 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 서버에 인증 코드 발송 요청
  const sendEmailCodeOnServer = async (email: string) => {
    try {
      await sendEmailCode(email);
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
