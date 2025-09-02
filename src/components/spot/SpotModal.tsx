// src/components/spot/SpotModal.tsx
import { useEffect, useRef, useState } from "react";
import type { Spot } from "@/types/map";

const CAT_LABEL: Record<string, string> = {
  food: "밥",
  cafe: "카페",
  study: "독서",
  walk: "산책",
  play: "놀거리",
};

interface SpotModalProps {
  open: boolean;
  spot?: Spot | null;
  onClose: () => void;
  onAddPhoto: (data: { url: string; caption?: string }) => void;
  onAddMessage: (data: { text: string }) => void;
}

export default function SpotModal({ open, onClose, spot, onAddPhoto, onAddMessage }: SpotModalProps) {
  const [tab, setTab] = useState<"photos" | "chat">("photos");
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [msg, setMsg] = useState("");
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [open]);

  if (!spot) return null;

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    onAddPhoto({ url: photoUrl, caption });
    setPhotoUrl("");
    setCaption("");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg) return;
    onAddMessage({ text: msg });
    setMsg("");
  };

  return (
    <dialog ref={dialogRef} className="w-[min(720px,96vw)] rounded-xl p-0">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <div>
          <div className="font-extrabold text-lg">{spot.alias || "스팟"}</div>
          <div className="text-gray-500 text-xs">
            {CAT_LABEL[spot.category] || "기타"} · ({spot.lat.toFixed(4)}, {spot.lng.toFixed(4)})
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button type="button" onClick={() => setTab("photos")} className={`px-2 py-1 rounded-md text-sm border ${tab === "photos" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-300"}`}>사진</button>
          <button type="button" onClick={() => setTab("chat")} className={`px-2 py-1 rounded-md text-sm border ${tab === "chat" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-300"}`}>채팅</button>
          <button type="button" onClick={onClose} className="px-2 py-1 text-xl border-0 bg-transparent cursor-pointer" aria-label="닫기">✖︎</button>
        </div>
      </div>

      <div className="p-3">
        {tab === "photos" && (
          <div>
            <form onSubmit={handleAddPhoto} className="flex gap-2 mb-3">
              <input type="url" placeholder="이미지 URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" placeholder="캡션(선택)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-48 px-2 py-1 border border-gray-300 rounded-md" />
              <button type="submit" className="px-3 py-1 rounded-md bg-blue-600 text-white">추가</button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(spot.photos ?? []).map((p, i) => (
                <figure key={i} className="rounded-lg overflow-hidden border">
                  <img src={p.url} alt={p.caption ?? "spot"} className="w-full h-36 object-cover" />
                  {p.caption && <figcaption className="text-xs p-2 text-gray-600">{p.caption}</figcaption>}
                </figure>
              ))}
              {(spot.photos ?? []).length === 0 && <div className="text-gray-400 text-sm">사진이 없습니다.</div>}
            </div>
          </div>
        )}

        {tab === "chat" && (
          <div>
            <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-md border">
              {(spot.messages ?? []).map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold">익명</span>
                  <span className="mx-2 text-gray-400">·</span>
                  <span className="text-gray-600">{new Date(m.ts).toLocaleString()}</span>
                  <div className="ml-1">{m.text}</div>
                </div>
              ))}
              {(spot.messages ?? []).length === 0 && <div className="text-gray-400 text-sm">메시지가 없습니다.</div>}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 mt-2">
              <input type="text" placeholder="메시지 입력" value={msg} onChange={(e) => setMsg(e.target.value)} className="flex-1 px-2 py-2 border border-gray-300 rounded-md" />
              <button type="submit" className="px-3 rounded-md bg-gray-900 text-white">전송</button>
            </form>
          </div>
        )}
      </div>
    </dialog>
  );
}
