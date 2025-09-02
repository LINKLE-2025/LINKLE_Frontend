import base from "./base.js";
import index from "./index.js";
import reactConfig from "./eslint.react.config.js";
import prettier from "./prettier.js";

export default [
  {
    ignores: ["dist", "node_modules"],
    settings: {
      "import/resolver": {
        alias: {
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // TS/TSX 전역에서 미사용 변수 경고 끄기
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off", // 기본 규칙도 같이 꺼줌
    },
  },
  base,
  index,
  reactConfig,
  prettier,

  // 추가: .d.ts 파일은 검사 제외
  {
    files: ["**/*.d.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off", // ← 오타 수정
      "@typescript-eslint/ban-types": "off",
    },
  },
];
