import tseslint from "typescript-eslint";

export default {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ["./tsconfig.json"],
      tsconfigRootDir: process.cwd(),
    },
  },
  rules: {
    ...tseslint.configs.recommendedTypeChecked[0].rules,
  },
};
