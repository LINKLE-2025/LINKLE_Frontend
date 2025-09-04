/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter", // 다른 환경에서는 Inter
          "SF Pro", // iOS/macOS 기기에서만 적용
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        linkleGray: "#414141",
      },
      animation: {
        blob: "blob 7s infinite", // 7초 주기로 반복
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
