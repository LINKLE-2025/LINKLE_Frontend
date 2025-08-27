# 📦 Installed Packages

이 문서는 `package.json` 기준으로 설치된 주요 패키지를 정리한 문서입니다.  
각 패키지는 **dependencies(실행 시 필요한 라이브러리)** 와 **devDependencies(개발 시 필요한 도구)** 로 구분되어 있습니다.

---

## ✅ Dependencies (실행 시 필요한 라이브러리)

| Package     | Version  | 설명 |
|-------------|----------|------|
| **react**   | ^19.1.1  | UI 개발을 위한 핵심 라이브러리 |
| **react-dom** | ^19.1.1 | React 컴포넌트를 실제 DOM에 렌더링하기 위한 패키지 |

---

## 🛠 DevDependencies (개발용 도구)

| Package                   | Version   | 설명 |
|---------------------------|-----------|------|
| **@eslint/js**            | ^9.33.0   | ESLint 기본 규칙 모음 |
| **@types/node**           | ^24.3.0   | Node.js 타입 정의 파일 (TypeScript 지원) |
| **@types/react**          | ^19.1.10  | React의 타입 정의 파일 |
| **@types/react-dom**      | ^19.1.7   | React DOM 타입 정의 파일 |
| **@vitejs/plugin-react**  | ^5.0.1    | Vite에서 React 지원 플러그인 |
| **@vitejs/plugin-react-swc** | ^4.0.0 | SWC 기반의 빠른 React 빌드 플러그인 |
| **autoprefixer**          | ^10.4.21  | CSS에 자동으로 벤더 프리픽스 추가 |
| **eslint**                | ^9.33.0   | 코드 스타일 검사 도구 |
| **eslint-plugin-react-hooks** | ^5.2.0 | React Hooks 규칙 검사 플러그인 |
| **eslint-plugin-react-refresh** | ^0.4.20 | React Fast Refresh 지원 ESLint 플러그인 |
| **globals**               | ^16.3.0   | ESLint 등에서 전역 변수 정의 지원 |
| **postcss**               | ^8.5.6    | CSS 변환 도구 (TailwindCSS와 함께 사용) |
| **tailwindcss**           | ^3.4.17   | 유틸리티 기반 CSS 프레임워크 |
| **typescript**            | ~5.8.3    | 정적 타입 언어 TypeScript |
| **typescript-eslint**     | ^8.39.1   | TypeScript용 ESLint 플러그인 |
| **vite**                  | ^7.1.2    | 빠른 빌드/개발 서버 도구 |

---

## 📌 정리

- `dependencies`: 실제 실행 환경에서 필요한 라이브러리 (React 등)
- `devDependencies`: 개발 시 필요한 빌드, 린트, 타입 검사, 스타일링 도구
- **React + Vite + Tailwind + TypeScript + ESLint/Prettier** 조합을 사용하여 최신 프론트엔드 환경을 구성

---


