import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "frontend/.next/**",
      ".next-build-tools/**",
      ".next-dev-tools/**",
      ".next-playwright-howto/**",
      ".contentlayer/**",
      "frontend/.contentlayer/**",
      ".worktrees/**",
      "node_modules/**",
    ],
  },
  {
    settings: {
      next: {
        rootDir: "frontend",
      },
    },
  },
  {
    files: ["frontend/app/api/**/*.ts", "frontend/app/api/**/*.tsx"],
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
    files: ["frontend/components/**/*.ts", "frontend/components/**/*.tsx"],
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
