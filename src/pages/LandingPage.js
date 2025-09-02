import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const LandingPage = () => {
    useEffect(() => {
        fetch("/api/test")
            .then((res) => {
            if (!res.ok)
                throw new Error("API 실패");
            return res.json();
        })
            .then((data) => console.log("API 응답:", data))
            .catch((err) => console.error(err));
    }, []);
    return (_jsxs("div", { className: 'flex flex-col min-h-screen font-sans text-black', children: [_jsxs("header", { className: 'flex items-center border-b border-gray-200 px-5 py-3', children: [_jsx("img", { src: '/linkle-icon.svg', alt: 'LINKLE \uB85C\uACE0', className: 'h-6 mr-2' }), _jsx("h1", { className: 'text-lg font-medium', children: "LINKLE" })] }), _jsxs("main", { className: 'flex flex-1 flex-col items-center justify-center px-6 text-center', children: [_jsxs("figure", { className: 'flex flex-col items-center', children: [_jsx("img", { src: '/linkle-icon.svg', alt: 'LINKLE \uC2EC\uBCFC', className: 'w-2/5 max-w-[400px] h-auto my-6 mt-[-40px]' }), _jsx("figcaption", { className: 'sr-only', children: "\uC11C\uBE44\uC2A4 \uB300\uD45C \uB85C\uACE0" })] }), _jsx("h2", { className: 'text-4xl md:text-5xl font-bold mb-4', children: "LINKLE" }), _jsxs("p", { className: 'text-gray-600 text-base md:text-lg leading-relaxed mb-6', children: ["\uB9C1\uCEE4\uC5D0 \uCC38\uC5EC\uD558\uACE0 \uCE5C\uAD6C\uB4E4\uC744 \uB9CC\uB098", _jsx("br", {}), "\uB2E4\uC591\uD55C \uCD94\uC5B5\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694."] }), _jsx("button", { className: 'bg-linkleGray hover:bg-black text-white font-bold py-3 px-8 rounded-full w-4/5 max-w-xs mb-6', children: "LINKLE \uC571 \uC5F4\uAE30" }), _jsxs("p", { className: 'text-sm md:text-base', children: [_jsx("a", { href: '/login', className: 'font-semibold text-linkleGray hover:text-black', children: "\uB85C\uADF8\uC778" }), " ", _jsx("span", { className: 'text-gray-400', children: "\uB610\uB294" }), " ", _jsx("a", { href: '/signup', className: 'font-semibold text-linkleGray hover:text-black', children: "\uAC00\uC785\uD558\uAE30" })] })] }), _jsx("footer", { className: 'text-gray-400 text-xs py-4 text-center', children: "\u00A9 TEAM CARDGARDEN" })] }));
};
export default LandingPage;
