import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
});

const eslintConfig = [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "scripts/**",
      "prisma/**",
      "public/**",
    ],
  },
  
  // Base configuration
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript"
  ),

  // TypeScript files with type-aware rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript strict rules that require type information - temporarily relaxed
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    },
  },

  // Additional rules for all files - temporarily relaxed
  {
    rules: {
      // TypeScript strict rules - temporarily relaxed
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-var-requires": "error",

      // React strict rules - temporarily relaxed
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
      "react/no-array-index-key": "warn",
      "react/no-danger": "warn",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": "warn",
      "react/no-unsafe": "warn",
      "react/self-closing-comp": "warn",
      "react/void-dom-elements-no-children": "error",

      // General code quality rules - temporarily relaxed
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      
      // Best practices - temporarily relaxed
      "eqeqeq": ["warn", "always"],
      "curly": ["warn", "all"],
      "no-eq-null": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-expressions": "warn",
      "no-duplicate-imports": "error",
      "no-useless-return": "warn",
      "no-useless-constructor": "warn",
      "no-useless-rename": "warn",
      "no-useless-concat": "warn",
      "no-useless-computed-key": "warn",
      "no-useless-catch": "warn",
      "no-useless-escape": "warn",
      
      // Code style - temporarily relaxed
      "indent": ["warn", 2],
      "quotes": ["warn", "single", { "avoidEscape": true }],
      "semi": ["warn", "always"],
      "comma-dangle": ["warn", "always-multiline"],
      "object-curly-spacing": ["warn", "always"],
      "array-bracket-spacing": ["warn", "never"],
      "comma-spacing": ["warn", { "before": false, "after": true }],
      "key-spacing": ["warn", { "beforeColon": false, "afterColon": true }],
      "keyword-spacing": ["warn", { "before": true, "after": true }],
      "space-before-blocks": "warn",
      "space-before-function-paren": ["warn", "always"],
      "space-in-parens": ["warn", "never"],
      "space-infix-ops": "warn",
      "space-unary-ops": "warn",
      "spaced-comment": ["warn", "always"],
      "arrow-spacing": "warn",
      "block-spacing": "warn",
      "brace-style": ["warn", "1tbs", { "allowSingleLine": true }],
      "camelcase": ["warn", { "properties": "never" }],
      "eol-last": "warn",
      "func-call-spacing": ["warn", "never"],
      "func-name-matching": "warn",
      "function-paren-newline": ["warn", "multiline"],
      "implicit-arrow-linebreak": ["warn", "beside"],
      "max-len": ["warn", { "code": 100, "ignoreUrls": true, "ignoreStrings": true }],
      "no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 0 }],
      "no-trailing-spaces": "warn",
      "no-whitespace-before-property": "warn",
      "object-property-newline": ["warn", { "allowAllPropertiesOnSameLine": true }],
      "operator-linebreak": ["warn", "before"],
      "padded-blocks": ["warn", "never"],
      "padding-line-between-statements": [
        "warn",
        { "blankLine": "always", "prev": "*", "next": "return" },
        { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
        { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] },
      ],
      "prefer-template": "warn",
      "template-curly-spacing": "warn",
      "yoda": "warn",
      
      // Variables - temporarily relaxed
      "no-undef": "error",
      "no-unused-vars": "off", // Handled by TypeScript
      "no-use-before-define": "warn",
      "no-shadow": "off", // Handled by TypeScript
      "@typescript-eslint/no-shadow": "warn",
      
      // Possible errors - temporarily relaxed
      "no-cond-assign": "warn",
      "no-constant-condition": "warn",
      "no-control-regex": "warn",
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-case": "error",
      "no-empty": "warn",
      "no-empty-character-class": "warn",
      "no-ex-assign": "error",
      "no-extra-boolean-cast": "warn",
      "no-extra-semi": "warn",
      "no-func-assign": "error",
      "no-inner-declarations": "error",
      "no-invalid-regexp": "error",
      "no-irregular-whitespace": "error",
      "no-loss-of-precision": "error",
      "no-misleading-character-class": "warn",
      "no-mixed-spaces-and-tabs": "error",
      "no-nonoctal-decimal-escape": "warn",
      "no-obj-calls": "error",
      "no-octal": "error",
      "no-octal-escape": "error",
      "no-redeclare": "off", // Handled by TypeScript
      "no-regex-spaces": "warn",
      "no-self-assign": "warn",
      "no-setter-return": "error",
      "no-sparse-arrays": "error",
      "no-template-curly-in-string": "warn",
      "no-unexpected-multiline": "warn",
      "no-unreachable": "warn",
      "no-unreachable-loop": "warn",
      "no-unsafe-finally": "warn",
      "no-unsafe-negation": "warn",
      "no-unsafe-optional-chaining": "warn",
      "use-isnan": "error",
      "valid-typeof": "error",
    },
  },
];

export default eslintConfig;
