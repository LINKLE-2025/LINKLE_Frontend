/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "SF Pro", // iOS/macOS 기기에서만 적용
          "Inter", // 다른 환경에서는 Inter
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        linkleGray: "#414141",
      },
    },
  },
  plugins: [],
};
