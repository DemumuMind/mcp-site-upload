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
      "node_modules/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
