import { jsx as _jsx } from "react/jsx-runtime";
const CircleButton = ({ imgSrc, alt, onClick, className = "", children }) => {
    return (_jsx("button", { type: "button", onClick: onClick, className: `w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer aria-pressed:opacity-80 ${className}`, "aria-label": alt, children: imgSrc ? _jsx("img", { src: imgSrc, alt: "", className: "w-5 h-5", "aria-hidden": true }) : children }));
};
export default CircleButton;
