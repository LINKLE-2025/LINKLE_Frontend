export const TAB_DM = "dm";
export const TAB_GROUP = "group";

export default function SegmentTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const base = "flex-1 py-2 text-sm font-medium rounded-full transition";
  const active = "bg-black text-white";
  const inactive = "bg-gray-100 text-gray-600 hover:bg-gray-200";
  return (
    <div className='mx-4 mt-2 mb-3 bg-gray-100 rounded-full p-1 flex gap-1'>
      <button
        className={`${base} ${value === TAB_DM ? active : inactive}`}
        onClick={() => onChange(TAB_DM)}
      >
        내 DM
      </button>
      <button
        className={`${base} ${value === TAB_GROUP ? active : inactive}`}
        onClick={() => onChange(TAB_GROUP)}
      >
        클래스·번개
      </button>
    </div>
  );
}
