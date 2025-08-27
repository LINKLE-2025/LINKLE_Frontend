// eslint.config.js
import base from "./base.js";
import index from "./index.js";
import reactConfig from "./eslint.react.config.js";
import prettier from "./prettier.js";

export default [
  {
    ignores: ["dist", "node_modules"],
    base,
    index,
    reactConfig,
    prettier,
    settings: {
      "import/resolver": {
        alias: {
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];
