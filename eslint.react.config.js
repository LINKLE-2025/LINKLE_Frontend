import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default {
  files: ["**/*.{jsx,tsx,ts}"],

  settings: {
    react: { version: "detect" }, // React 버전 자동 감지
  },

  plugins: {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
  },

  rules: {
    // React 권장 규칙
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,

    // Hooks 권장 규칙
    ...reactHooks.configs.recommended.rules,

    // target="_blank" 보안 규칙 끄기
    "react/jsx-no-target-blank": "off",

    // Fast Refresh 관련 규칙
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    // ✅ TS/TSX 전역에서 미사용 변수/any 관련 경고 끄기
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
  },

  globals: {
    kakao: "readonly",
  },
};
