import { useEffect, useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import AuthOutlinedButton from "../AuthOutlinedButton";
import axios from "axios";

type Props = {
  value: string;
  email: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function VerifyCodeStep({ value, email, onChange, onNext }: Props) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      setSuccess("");
    }
  }, [error]);
  useEffect(() => {
    if (success) {
      setError("");
    }
  }, [success]);

  const handleNext = () => {
    if (!value) {
      setError("인증번호가 올바르지 않습니다.");
      return;
    }

    setError("");
    console.log("인증 코드:", value);

    // 인증코드 검증
    verifyCodeOnServer(email, value).then((isValid) => {
      if (isValid) {
        console.log("인증 코드가 확인되었습니다. 다음 단계로 이동");
        onNext();
      }
    });
  };

  const handleSendCode = () => {
    setSuccess("인증 코드를 다시 전송했습니다.");
    console.log("인증 코드 재전송 요청");
    sendVerificationCode(email);
  };

  // 서버에 인증코드 검증 요청
  const verifyCodeOnServer = async (email: string, code: string) => {
    try {
      const response = await axios.post(
        `/api/auth/email/${encodeURIComponent(email)}/code/${code}`,
      );
      console.log("인증 코드 검증 결과: " + response.data);
      if (response.data) {
        return true;
      }
      setError("인증번호가 올바르지 않습니다.");
      return false;
    } catch (error) {
      console.error("인증 코드 검증 오류: ", error);
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
      {/* 인증 코드 입력 */}
      <AuthInput
        type='text'
        placeholder='인증 코드 6자리'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        success={success}
        error={error}
        maxLength={6}
      />

      {/* 다음 버튼 */}
      <AuthFilledButton type='button' className='mt-5 mb-3' onClick={handleNext}>
        다음
      </AuthFilledButton>

      {/* 코드 재전송 버튼 */}
      <AuthOutlinedButton type='button' className='mb-5 sm:mb-7' onClick={handleSendCode}>
        코드를 받지 못했습니다
      </AuthOutlinedButton>
    </div>
  );
}
