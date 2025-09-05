type PostFormBaseProps = {
  text: string;
  imageUrl?: string | null;
  authorName?: string;
  authorHandle?: string;
  linkerName?: string;
  linkerAddress?: string | null;
  onChangeText?: (v: string) => void;
  readOnly?: boolean;
  actions?: React.ReactNode; //버튼을 바깥에서 주입
};

export function PostFormBase({
  text,
  imageUrl,
  authorName,
  authorHandle,
  linkerName,
  linkerAddress,
  onChangeText,
  readOnly = false,
  actions,
}: PostFormBaseProps) {
  return (
    <div className='flex flex-col bg-[#f6f6f6]'>
      {/* 이미지 */}
      <div className='h-[42vh] flex items-center justify-center bg-gray-100'>
        {imageUrl ? (
          <img src={imageUrl} alt='' className='max-h-full max-w-full object-contain' />
        ) : (
          <span className='text-gray-400'>이미지 없음</span>
        )}
      </div>

      {/* 작성자 */}
      <div className='bg-white px-4 py-3 border-b'>
        <div className='font-semibold text-sm'>{authorName ?? "익명"}</div>
        <div className='text-xs text-gray-400'>{authorHandle ?? ""}</div>
      </div>

      {/* 텍스트 */}
      <div className='bg-white px-4 py-3'>
        <textarea
          value={text}
          onChange={(e) => onChangeText?.(e.target.value)}
          readOnly={readOnly}
          className='w-full resize-none outline-none text-[14px] bg-transparent'
        />
      </div>

      {/* 액션 버튼 */}
      {actions && <div className='border-t bg-white'>{actions}</div>}
    </div>
  );
}
