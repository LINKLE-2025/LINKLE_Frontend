import { useState } from "react";
import AuthInput from "@/components/auth/AuthInput";
import AuthFilledButton from "@/components/auth/AuthFilledButton";
import { checkNickname } from "@/api/authApi";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function NicknameStep({ value, onChange, onNext }: Props) {
  const [error, setError] = useState("");
  const nicknameRegex = /^[0-9a-z_]{4,20}$/; // 예: 4~20자의 숫자, 영문 소문자 및 언더스코어

  const handleNext = async () => {
    // 닉네임 유효성 검사
    if (!value) {
      setError("닉네임을 입력하세요.");
      return;
    }

    // 닉네임 형식 검사
    if (!nicknameRegex.test(value)) {
      setError("유효하지 않은 닉네임 형식입니다.");
      return;
    }

    // 중복 검사 요청
    const isNicknameExists = await checkNicknameOnServer(value);
    if (isNicknameExists) {
      setError("이미 사용 중인 닉네임입니다.");
      return;
    }


    // 형식 검사 통과
    setError("");
    console.log("닉네임:", value);

    console.log("닉네임 확인 완료, 다음 단계로 이동");
    onNext();
  };

  // 닉네임 중복 검사 요청
  const checkNicknameOnServer = async (nickname: string) => {
    try {
      const { exists } = await checkNickname(nickname);
      console.log("닉네임 중복 검사 결과: " + exists);
      if (exists) {
        console.log("닉네임 사용 중");
        return true;
      }
      console.log("닉네임 사용 가능");
      return false;
    } catch (error) {
      console.error("닉네임 중복 검사 오류: ", error);
      setError("서버와 통신 중 오류가 발생했습니다.");
      return false;
    }
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
