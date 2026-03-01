import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      ".next-build-tools/**",
      ".next-dev-tools/**",
      ".next-playwright-howto/**",
      ".contentlayer/**",
      ".worktrees/**",
      "node_modules/**",
    ],
  },
  {
    files: ["app/api/**/*.ts", "app/api/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/components/*"],
        },
      ],
    },
  },
  {
    files: ["components/**/*.ts", "components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/app/**/page", "@/app/**/layout", "@/app/**/route"],
        },
      ],
    },
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
