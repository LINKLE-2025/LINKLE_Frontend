# 스타일 가이드 (설명 정리본)

## 들어가기
- Linkle 프론트엔드(React) 프로젝트의 코드 컨벤션은 ESLint와 Prettier를 기준으로 합니다.
- 본 문서는 적용 대상 파일, 세부 규칙, 코드 스타일 가이드(TailwindCSS 포함)에 대해 설명합니다. 
--- 
## ESLint & Prettier

### 1. 적용 대상
- 모든 JavaScript / TypeScript 관련 파일에 적용 (`.js`, `.jsx`, `.ts`, `.tsx`).

---

### 2. Prettier 설정
- 한 줄 최대 길이는 100자로 제한  
- 들여쓰기는 2칸  
- 모든 경우에 마지막 쉼표를 붙임  
- 문자열은 큰따옴표를 기본으로 사용  
- JSX에서도 큰따옴표를 사용  
- 구문 끝에는 세미콜론을 붙임  
- 마크다운의 줄바꿈과 JSX의 공백은 그대로 유지  
- TailwindCSS 관련 속성은 자동으로 정렬되도록 플러그인 사용  

---

### 3. React ESLint 규칙
- React 버전은 자동 감지  
- JSX 문법 검사, Hooks 규칙 검사, HMR 안정성 규칙을 활성화  
- React 권장 규칙과 JSX Transform 관련 규칙을 적용  
- Hooks 사용 시 `rules-of-hooks`, `exhaustive-deps` 검사 활성화  
- `target="_blank"` 보안 속성 강제 규칙은 끔  
- HMR 안정성을 위해 export는 기본적으로 컴포넌트만 허용. 단순 상수 export는 예외적으로 허용  

---

### 4. TypeScript ESLint 규칙
- **기본 검사 (index.js)**  
  - 최신 ECMAScript 지원, ES Module 사용  
  - 타입체크는 하지 않고 권장 규칙만 적용  

- **타입체크 강화 검사 (typeCheck.js)**  
  - `tsconfig.json`을 기반으로 타입 검사를 수행  
  - 권장되는 타입체크 규칙을 적용  

---

### ✅ 요약
- **Prettier**: 코드 스타일 통일 (줄 길이, 따옴표, 세미콜론, Tailwind 정렬 등)  
- **React**: 권장 규칙, Hooks 검사, HMR 안정성 확보  
- **TypeScript**: 상황에 따라 타입체크 없는 규칙과 타입체크 활성 규칙을 구분해서 적용  

---

## TailwindCSS
- TailwindCSS는 PostCSS 플러그인을 통해 적용  
- `tailwind.config.js`에서는 HTML과 `src` 폴더 안의 JS/TS/JSX/TSX 파일을 대상으로 Tailwind 클래스를 스캔  
- 필요한 경우 theme를 확장하거나 플러그인을 추가해 사용  

---

## 링크 설정 (경로 별칭)
- VSCode와 Vite에서 경로 별칭을 설정하기 위해 `vite.config.ts`, `tsconfig.json` 사용  
- `@` 기호를 `src/` 폴더와 연결하여 import 시 상대경로 대신 간단하게 사용 가능  
- tsconfig.json에 타입 경로를 지정함으로써, VSCode 자동완성과 타입 추론 기능을 향상  
- `node_modules`와 `dist` 폴더는 검사에서 제외
