import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Temporarily warn instead of error for gradual migration
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn"
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "coverage/",
      "*.config.js",
      "*.config.mjs",
      "jest.setup.js",
      "next-env.d.ts"
    ]
  }
];

export default eslintConfig;
