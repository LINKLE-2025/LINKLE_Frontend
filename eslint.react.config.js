import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default {
  // 이 설정이 적용될 파일 확장자
  files: ["**/*.{jsx,tsx}"], // React 컴포넌트가 들어있는 JSX/TSX 파일만 대상으로 함

  //React 버전 자동 감지(자동으로 설치된 버전 인식)
  settings: {
    react: { version: "detect" },
  },
  // 사용할 플러그인 목록
  plugins: {
    react, // JSX 문법 검사, React 전용 규칙
    "react-hooks": reactHooks, // useState, useEffect 같은 Hook 규칙 검사
    "react-refresh": reactRefresh, // HMR(Hot Module Replacement) 관련 안전성 규칙
  },

  // 세부 규칙 정의
  rules: {
    // React 권장 규칙(eslint-plugin-react 기본 recommended 세트)
    ...react.configs.recommended.rules,
    // React 17+부터 도입된 새로운 JSX Transform 관련 규칙
    ...react.configs["jsx-runtime"].rules,
    // React Hooks 권장 규칙 (useEffect 의존성 배열 검사 등)
    // 1. rules-of-hooks: Hook은 함수 컴포넌트/커스텀 Hook 안에서만 사용
    // 2. exhaustive-deps: useEffect 의존성 자동 검사
    ...reactHooks.configs.recommended.rules,
    // target="_blank" 링크에 rel="noreferrer" 같은 보안 속성 강제하는 규칙 → 끔
    // 1. <a href="..." target="_blank">에 rel="noopener noreferrer" 안 붙이면 보안 경고하는 규칙
    // 2. 악성 사이트로 링크 바뀌는 것을 방지
    "react/jsx-no-target-blank": "off",
    // Fast Refresh 관련 규칙
    // export 하는 것은 React 컴포넌트만 허용 (HMR 안전성 확보)
    /*
        // ✅ 컴포넌트 export → 정상
        export function App() {
          return <h1>Hello Linkle!</h1>;
        }

        // ✅ default export도 컴포넌트면 정상
        export default function Page() {
          return <div>Page</div>;
        }

        // ❌ 일반 상수 export → 기본 규칙에선 Fast Refresh 깨질 수 있음
        export const API_URL = "https://api.example.com";

        // ❌ 함수인데 컴포넌트 아님 (JS 함수 export)
        export function add(a: number, b: number) {
          return a + b;
        }
    */
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }], // 단순 상수 export는 허용
  },
};
