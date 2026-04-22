import { TileSelector } from "./TileSelector";

export default {
  title: "Example/TileSelector",
  component: TileSelector,
  parameters: {
    layout: "centered",
  },
};

// Numeric options story
export const NumericOptions = {
  args: {
    selectionText: "Select your lucky number",
    options: [1, 2, 3, 6, 8, 99, 0, 67],
    onChange: (value) => console.log("Selected:", value),
  },
};

// String options story
export const StringOptions = {
  args: {
    selectionText: "Select type",
    options: [
      { value: "new", label: "New" },
      { value: "existing", label: "Existing" },
    ],
    onChange: (value) => console.log("Selected:", value),
  },
};

// With custom render story
export const WithCustomRender = {
  args: {
    options: [1, 2],
    defaultValue: 1,
    className: "w-24 h-10",
    renderOptionLabel: (value) =>
      value === 1 ? (
        <span className="inline-flex justify-center" aria-label="Grid view">
          ⊞
        </span>
      ) : (
        <span className="inline-flex justify-center" aria-label="List view">
          ☰
        </span>
      ),
    onChange: (value) => console.log("Selected:", value),
  },
};
