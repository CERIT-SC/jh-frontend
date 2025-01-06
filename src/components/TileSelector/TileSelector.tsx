import React, { useState } from "react";
import "./TileSelector.css";

interface TileSelectorProps {
  title: string;
  selectionText: string;
  numberOptions: number[];
  setFormData: (value: number) => void;
  defaultSelect?: number;
}

export const TileSelector: React.FC<TileSelectorProps> = ({
  title,
  selectionText,
  numberOptions,
  setFormData,
  defaultSelect,
}) => {
  const [selectedMemory, setSelected] = useState(defaultSelect ? defaultSelect : numberOptions[0]);

  const handleSelection = (value) => {
    setSelected(value);
    setFormData(value);
  };

  return (
    <div className="section">
      <div className="field-title"> {title} </div>
      <div className="field-container">
        <div className="selection-container">
          <p className="selection-text"> {selectionText} </p>
          <div className="tiles-container">
            {numberOptions.map((value) => (
              <div
                key={value}
                className={`tile memory-tile ${selectedMemory === value ? "active" : ""}`}
                onClick={() => handleSelection(value)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
