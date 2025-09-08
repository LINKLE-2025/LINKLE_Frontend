import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; // 라벨 텍스트
  success?: string; // 성공 메시지
  error?: string; // 에러 메시지
  selected?: boolean; // 선택된 상태
  className?: string; // 추가적인 클래스 이름
};

export default function AuthInput({
  label,
  error,
  success,
  className = "",
  selected,
  ...props
}: Props) {
  return (
    <div className='w-full flex flex-col gap-1'>
      {/* 라벨 */}
      {label && <label className='text-sm font-medium text-gray-700'>{label}</label>}

      {/* 인풋 */}
      <input
        {...props}
        className={`
          w-full bg-white/75 rounded-xl border border-gray-300 px-4 py-3 text-base
          focus:outline-none focus:ring-1 focus:ring-linkleGray focus:border-linkleGray
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          ${selected ? "border-linkleGray border-2 focus:outline-none" : ""}
          ${className}
        `}
      />

      <div className='text-center'>
        {/* 성공 메시지 */}
        {success && <p className='text-sm font-medium text-green-600'>{success}</p>}

        {/* 에러 메시지 */}
        {error && <p className='text-sm font-medium text-red-500'>{error}</p>}
      </div>
    </div>
  );
}
