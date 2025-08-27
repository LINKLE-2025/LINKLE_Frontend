import tseslint from "typescript-eslint";

// index.js 기본 JavaScript/TypeScript 규칙
export default {
  // 어떤 파일에 이 설정을 적용할지 지정
  files: ["**/*.{js,jsx,ts,tsx}"],
  // 언어 옵션
  languageOptions: {
    parser: tseslint.parser, // TypeScript 코드 파싱을 담당
    parserOptions: {
      ecmaVersion: "latest", // 최신 ECMAScript 문법 지원
      sourceType: "module", // ES Modules(import/export) 사용
      project: false, // 타입 체크 모드는 끔
    },
  },
  rules: {
    // @typescript-eslint/eslint-plugin 의 권장 규칙 불러오기
    // configs.recommended[0] = 타입체크 없는 기본 규칙 모음
    ...tseslint.configs.recommended[0].rules,
  },
};
