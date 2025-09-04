import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  backTo?: string; // 기본은 뒤로가기, 특정 주소 지정 가능
  className?: string;
};

export default function BackUserHeader({ title, backTo, className }: Props) {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 w-full flex items-center justify-center bg-white border-b border-gray-200 px-5 py-3 z-50 ${className}`}
    >
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className='absolute left-5 flex items-center'
      >
        <img src='/icons/common/back.svg' alt='뒤로가기' className='h-5 w-5' />
      </button>

      {/* 중앙 타이틀 */}
      <h1 className='text-lg font-bold'>{title}</h1>
    </header>
  );
}
