import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/spot/SpotModal.tsx
import { useEffect, useRef, useState } from "react";
const CAT_LABEL = {
    food: "밥",
    cafe: "카페",
    study: "독서",
    walk: "산책",
    play: "놀거리",
};
export default function SpotModal({ open, onClose, spot, onAddPhoto, onAddMessage }) {
    const [tab, setTab] = useState("photos");
    const [photoUrl, setPhotoUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [msg, setMsg] = useState("");
    const dialogRef = useRef(null);
    useEffect(() => {
        if (!dialogRef.current)
            return;
        if (open)
            dialogRef.current.showModal();
        else
            dialogRef.current.close();
    }, [open]);
    if (!spot)
        return null;
    const handleAddPhoto = (e) => {
        e.preventDefault();
        if (!photoUrl)
            return;
        onAddPhoto({ url: photoUrl, caption });
        setPhotoUrl("");
        setCaption("");
    };
    const handleSend = (e) => {
        e.preventDefault();
        if (!msg)
            return;
        onAddMessage({ text: msg });
        setMsg("");
    };
    return (_jsxs("dialog", { ref: dialogRef, className: "w-[min(720px,96vw)] rounded-xl p-0", children: [_jsxs("div", { className: "flex justify-between items-center px-4 py-3 border-b border-gray-200", children: [_jsxs("div", { children: [_jsx("div", { className: "font-extrabold text-lg", children: spot.alias || "스팟" }), _jsxs("div", { className: "text-gray-500 text-xs", children: [CAT_LABEL[spot.category] || "기타", " \u00B7 (", spot.lat.toFixed(4), ", ", spot.lng.toFixed(4), ")"] })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("button", { type: "button", onClick: () => setTab("photos"), className: `px-2 py-1 rounded-md text-sm border ${tab === "photos" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-300"}`, children: "\uC0AC\uC9C4" }), _jsx("button", { type: "button", onClick: () => setTab("chat"), className: `px-2 py-1 rounded-md text-sm border ${tab === "chat" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-300"}`, children: "\uCC44\uD305" }), _jsx("button", { type: "button", onClick: onClose, className: "px-2 py-1 text-xl border-0 bg-transparent cursor-pointer", "aria-label": "\uB2EB\uAE30", children: "\u2716\uFE0E" })] })] }), _jsxs("div", { className: "p-3", children: [tab === "photos" && (_jsxs("div", { children: [_jsxs("form", { onSubmit: handleAddPhoto, className: "flex gap-2 mb-3", children: [_jsx("input", { type: "url", placeholder: "\uC774\uBBF8\uC9C0 URL", value: photoUrl, onChange: (e) => setPhotoUrl(e.target.value), className: "flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" }), _jsx("input", { type: "text", placeholder: "\uCEA1\uC158(\uC120\uD0DD)", value: caption, onChange: (e) => setCaption(e.target.value), className: "w-48 px-2 py-1 border border-gray-300 rounded-md" }), _jsx("button", { type: "submit", className: "px-3 py-1 rounded-md bg-blue-600 text-white", children: "\uCD94\uAC00" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: [(spot.photos ?? []).map((p, i) => (_jsxs("figure", { className: "rounded-lg overflow-hidden border", children: [_jsx("img", { src: p.url, alt: p.caption ?? "spot", className: "w-full h-36 object-cover" }), p.caption && _jsx("figcaption", { className: "text-xs p-2 text-gray-600", children: p.caption })] }, i))), (spot.photos ?? []).length === 0 && _jsx("div", { className: "text-gray-400 text-sm", children: "\uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })] })), tab === "chat" && (_jsxs("div", { children: [_jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-md border", children: [(spot.messages ?? []).map((m, i) => (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "\uC775\uBA85" }), _jsx("span", { className: "mx-2 text-gray-400", children: "\u00B7" }), _jsx("span", { className: "text-gray-600", children: new Date(m.ts).toLocaleString() }), _jsx("div", { className: "ml-1", children: m.text })] }, i))), (spot.messages ?? []).length === 0 && _jsx("div", { className: "text-gray-400 text-sm", children: "\uBA54\uC2DC\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })] }), _jsxs("form", { onSubmit: handleSend, className: "flex gap-2 mt-2", children: [_jsx("input", { type: "text", placeholder: "\uBA54\uC2DC\uC9C0 \uC785\uB825", value: msg, onChange: (e) => setMsg(e.target.value), className: "flex-1 px-2 py-2 border border-gray-300 rounded-md" }), _jsx("button", { type: "submit", className: "px-3 rounded-md bg-gray-900 text-white", children: "\uC804\uC1A1" })] })] }))] })] }));
}
