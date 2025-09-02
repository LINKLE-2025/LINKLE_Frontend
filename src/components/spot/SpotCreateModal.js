import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/spot/SpotCreateModal.tsx
import { useEffect, useRef, useState } from "react";
export default function SpotCreateModal({ open, draft, onClose, onCreate }) {
    const dialogRef = useRef(null);
    const [alias, setAlias] = useState("");
    const [category, setCategory] = useState("food");
    useEffect(() => {
        if (!dialogRef.current)
            return;
        if (open)
            dialogRef.current.showModal();
        else
            dialogRef.current.close();
    }, [open]);
    if (!draft)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!alias)
            return;
        onCreate({ alias, category, lat: draft.lat, lng: draft.lng, photos: [], messages: [] });
        setAlias("");
        setCategory("food");
    };
    return (_jsx("dialog", { ref: dialogRef, className: "w-[min(560px,94vw)] rounded-xl p-0", children: _jsxs("form", { onSubmit: handleSubmit, className: "p-4 space-y-3", children: [_jsx("header", { className: "font-semibold text-lg", children: "\uC2A4\uD31F \uB9CC\uB4E4\uAE30" }), _jsxs("div", { className: "text-sm text-gray-500", children: ["(", draft.lat.toFixed(5), ", ", draft.lng.toFixed(5), ") \u00B7 ", draft.address] }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsx("input", { className: "px-3 py-2 border rounded-md", placeholder: "\uBCC4\uCE6D", value: alias, onChange: (e) => setAlias(e.target.value) }), _jsxs("select", { className: "px-3 py-2 border rounded-md", value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "food", children: "\uBC25" }), _jsx("option", { value: "cafe", children: "\uCE74\uD398" }), _jsx("option", { value: "study", children: "\uB3C5\uC11C" }), _jsx("option", { value: "walk", children: "\uC0B0\uCC45" }), _jsx("option", { value: "play", children: "\uB180\uAC70\uB9AC" })] })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-3 py-2 rounded-md border", children: "\uCDE8\uC18C" }), _jsx("button", { type: "submit", className: "px-3 py-2 rounded-md bg-blue-600 text-white", children: "\uC0DD\uC131" })] })] }) }));
}
