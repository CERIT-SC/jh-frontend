import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: [
      "dist_hub/**",
      "dist_cas/**",
      "dist_c9088/**",
      "dist_elter-ri/**",
      "c9088/**",
      "cas/**",
      "elter-ri/**",
      "storybook-static/**",
      "node_modules/**",
      ".storybook/**",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  // Config files run in Node, not the browser
  {
    files: ["vite.config.js", "postcss.config.js", "tailwind.config.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
