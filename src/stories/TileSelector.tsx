import React, { useState } from "react";
import "./TileSelector.css";

export const TileSelector = ({
  title,
  selectionText,
  numberOptions,
  setFormData,
}) => {
  const [selectedMemory, setSelected] = useState(numberOptions[0]);

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
