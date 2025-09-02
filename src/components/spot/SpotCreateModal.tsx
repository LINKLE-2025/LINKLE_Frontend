// src/components/spot/SpotCreateModal.tsx
import { useEffect, useRef, useState } from "react";
import type { Draft, Spot } from "@/types/map";

interface SpotCreateModalProps {
  open: boolean;
  draft: Draft | null;
  onClose: () => void;
  onCreate: (spot: Spot) => void;
}

export default function SpotCreateModal({ open, draft, onClose, onCreate }: SpotCreateModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [alias, setAlias] = useState("");
  const [category, setCategory] = useState("food");

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [open]);

  if (!draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias) return;
    onCreate({ alias, category, lat: draft.lat, lng: draft.lng, photos: [], messages: [] });
    setAlias("");
    setCategory("food");
  };

  return (
    <dialog ref={dialogRef} className="w-[min(560px,94vw)] rounded-xl p-0">
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <header className="font-semibold text-lg">스팟 만들기</header>
        <div className="text-sm text-gray-500">({draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}) · {draft.address}</div>
        <div className="grid grid-cols-1 gap-2">
          <input className="px-3 py-2 border rounded-md" placeholder="별칭" value={alias} onChange={(e)=>setAlias(e.target.value)} />
          <select className="px-3 py-2 border rounded-md" value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option value="food">밥</option>
            <option value="cafe">카페</option>
            <option value="study">독서</option>
            <option value="walk">산책</option>
            <option value="play">놀거리</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border">취소</button>
          <button type="submit" className="px-3 py-2 rounded-md bg-blue-600 text-white">생성</button>
        </div>
      </form>
    </dialog>
  );
}
