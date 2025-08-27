import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// 기본 ESLint 설정(프론트엔드/백엔드 공통)

// ✅ ESLint Flat Config 내보내기
export default {
  // 검사할 파일 확장자 지정
  files: ["**/*.{js,jsx,ts,tsx}"],

  // 언어 옵션 설정
  languageOptions: {
    parser: tseslint.parser, // TypeScript 파서 사용
    ecmaVersion: "latest", // 최신 ECMAScript 문법 지원
    sourceType: "module", // ES Modules 방식 사용(import/export)
    globals: {
      ...globals.browser, // 브라우저 전역(window, document 등)
      ...globals.node, // Node.js 전역(require, process 등)
      React: "writable", // React를 전역으로 간주 (React 17+에서 import 불필요)
    },
  },

  // 사용할 ESLint 플러그인 목록
  plugins: {
    react, // React 린트 규칙
    "react-hooks": reactHooks, // React Hooks 전용 규칙
    "@typescript-eslint": tseslint.plugin, // TS 전용 규칙
  },

  // React 버전 감지 설정
  settings: {
    react: { version: "detect" }, // 설치된 React 버전을 자동 감지
  },

  // 규칙 정의
  rules: {
    // ✅ ESLint/React/Hooks 권장 규칙 불러오기
    ...js.configs.recommended.rules,
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules, // React 17+ JSX Transform
    ...reactHooks.configs.recommended.rules,

    // --- React 관련 규칙 ---
    "react-hooks/rules-of-hooks": "error", // Hook은 조건문/반복문 안에서 금지
    "react/jsx-no-useless-fragment": "off", // 불필요한 <></> 허용
    "react/prop-types": "off", // TS 사용하므로 PropTypes 검사는 꺼둠
    "react/function-component-definition": [
      "error",
      { namedComponents: ["arrow-function", "function-declaration"] }, // 함수형 컴포넌트 정의 허용
    ],
    "react/jsx-props-no-spreading": "off", // props 전개 연산자 사용 허용
    "react/react-in-jsx-scope": "off", // React 17+에선 import React 불필요
    "react/prefer-stateless-function": "off", // Stateless function 강제하지 않음
    "react/jsx-filename-extension": "off", // .js/.jsx/.ts/.tsx 어디서든 JSX 허용
    "react/jsx-one-expression-per-line": "off", // JSX 표현식 한 줄 제한 비활성화

    // --- import 관련 규칙 ---
    "import/order": "off", // import 순서 강제 안 함
    "import/prefer-default-export": "off", // default export 강제 안 함
    "import/extensions": "off", // import 시 확장자 생략 허용
    "import/no-unresolved": "off", // TS/별칭 경로 무시 (tsconfig가 대신 처리)

    // --- JS/TS 일반 규칙 ---
    "prefer-arrow-callback": "off", // 콜백은 화살표 함수 강제 안 함
    "no-var": "error", // var 금지, let/const 사용 강제
    "no-dupe-keys": "error", // 객체 내 중복 key 금지
    "no-nested-ternary": "off", // 중첩 삼항 연산자 허용

    // --- TS 전용 규칙 ---
    "@typescript-eslint/no-explicit-any": "error", // any 사용 금지
  },
};
