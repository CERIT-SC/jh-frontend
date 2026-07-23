/** @type { import('@storybook/react').Preview } */

import { withThemeByClassName } from "@storybook/addon-themes";

import "../src/styles/index.css";

const preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
