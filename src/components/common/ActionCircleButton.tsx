interface CircleButtonProps {
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  imgSrc?: string;
  alt?: string | "";
  message?: string;
  children?: React.ReactNode;
}


export default function ActionCircleButton(props: CircleButtonProps) {
  const { className, onClick, icon, imgSrc, alt, message } = props;

  return (
    <button
      className={`flex flex-row items-center border border-gray-300 rounded-full p-2 gap-1.5
          		 bg-white shadow-sm hover:bg-gray-50 transition duration-75 ${className}`}
      onClick={onClick}>
      {/* 버튼 아이콘 */}
      {icon && icon}
      {/* 버튼 이미지 */}
      {imgSrc && <img src={imgSrc} alt={alt} />}
      {/* 버튼 드롭다운 */}
      {props.children}
      {/* 버튼 텍스트 */}
      {message && <p className="text-gray-700 text-[14px] font-semibold">{message}</p>}
    </button>
  );
}