import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
const ACTIVITIES = [
    "식사",
    "카페",
    "음악",
    "영화",
    "독서",
    "운동",
    "음주",
    "학습",
    "쇼핑",
    "병원",
    "게임",
    "여행",
];
export default function LinkerCreateModal({ open, onClose, initial, onSubmit, }) {
    const dialogRef = useRef(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [address, setAddress] = useState("");
    const [shopName, setShopName] = useState("");
    const [activityId, setActivityId] = useState(null);
    // 초기 값 세팅
    useEffect(() => {
        if (!initial)
            return;
        setAddress(initial.address ?? "");
        setShopName(initial.name ?? "");
        setTitle("");
        setTags("");
        setActivityId(null);
    }, [initial]);
    // 모달 show/hide
    useEffect(() => {
        if (!dialogRef.current)
            return;
        if (open)
            dialogRef.current.showModal();
        else
            dialogRef.current.close();
    }, [open]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title)
            return alert("제목을 입력하세요.");
        if (!activityId)
            return alert("활동을 선택하세요.");
        const words = address.trim().split(/\s+/);
        const addressDetail = words.slice(0, 2).join(" ");
        onSubmit({
            name: title,
            shopName: shopName,
            memo: tags,
            address,
            locationX: initial?.lat,
            locationY: initial?.lng,
            categoryId: activityId,
            addressDetail,
        });
    };
    return (_jsx("dialog", { ref: dialogRef, className: 'max-w-[420px] w-[90%] rounded-xl border-0 p-0', children: _jsxs("form", { onSubmit: handleSubmit, className: 'flex flex-col', children: [_jsxs("div", { className: 'flex items-center justify-between border-b border-gray-200 px-4 py-3', children: [_jsx("strong", { children: "\uB9C1\uCEE4 \uC0DD\uC131" }), _jsx("button", { type: 'button', onClick: onClose, className: 'text-base cursor-pointer bg-transparent border-0', children: "\uB2EB\uAE30" })] }), _jsxs("div", { className: 'grid gap-3 p-4', children: [_jsxs("div", { children: [_jsx("div", { className: 'mb-1.5 text-xs text-gray-500', children: "\uBCC4\uCE6D\uC744 \uC9C0\uC815\uD574 \uC8FC\uC138\uC694" }), _jsx("input", { placeholder: '\uC608) \uD568\uBD80\uAE30\uD568\uBD80\uAE30\uC9D1', value: title, onChange: (e) => setTitle(e.target.value), className: 'w-full rounded-lg border border-gray-300 px-3 py-2.5' })] }), _jsxs("div", { children: [_jsx("div", { className: 'mb-1.5 text-xs text-gray-500', children: "\uD0DC\uADF8\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694" }), _jsx("input", { placeholder: '#\uBC25\uCE5C\uAD6C  #\uD584\uBC84\uAC70', value: tags, onChange: (e) => setTags(e.target.value), className: 'w-full rounded-lg border border-gray-300 px-3 py-2.5' })] }), _jsxs("div", { children: [_jsx("div", { className: 'mb-1.5 text-xs text-gray-500', children: "\uB3C4\uB85C\uBA85 \uC8FC\uC18C" }), _jsx("input", { value: address, readOnly: true, className: 'w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5' })] }), _jsxs("div", { children: [_jsx("div", { className: 'mb-1.5 text-xs text-gray-500', children: "\uC0C1\uD638\uBA85" }), _jsx("input", { value: shopName, readOnly: true, className: 'w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5', placeholder: '\uC9C0\uB3C4\uC5D0\uC11C \uAC00\uC838\uC628 \uC0C1\uD638\uBA85\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4' })] }), _jsxs("div", { children: [_jsx("div", { className: 'mb-2 text-xs text-gray-500', children: "\uD65C\uB3D9\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694" }), _jsx("div", { className: 'grid grid-cols-4 gap-2', children: ACTIVITIES.map((label, idx) => {
                                        const id = idx + 1;
                                        const selected = activityId === id;
                                        return (_jsx("button", { type: 'button', onClick: () => setActivityId(id), className: `rounded-xl border px-2 py-2.5 text-sm cursor-pointer transition ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`, "aria-pressed": selected, "aria-label": `${label} 선택`, children: label }, id));
                                    }) })] })] }), _jsxs("div", { className: 'flex gap-2 border-t border-gray-200 p-4', children: [_jsx("button", { type: 'button', onClick: onClose, className: 'flex-1 rounded-lg border border-gray-300 bg-white py-2.5', children: "\uCDE8\uC18C" }), _jsx("button", { type: 'submit', className: 'flex-[2] rounded-lg border-0 bg-gray-900 py-2.5 text-white', children: "\uB9C1\uCEE4 \uC0DD\uC131\uD558\uAE30" })] })] }) }));
}
