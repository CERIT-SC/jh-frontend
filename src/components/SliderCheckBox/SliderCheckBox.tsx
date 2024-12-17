import React, { useState } from "react";
import "./SliderCheckBox.css";

interface TileSelectorProps {
  title: string;
  children: React.ReactNode;
  onChange: (checked) => void;
}

export const SliderCheckBox: React.FC<TileSelectorProps> = ({
  title,
  onChange,
  children,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = (checked) => {
    setIsChecked(checked);
    if (onChange !== undefined) {
      onChange(checked);
    }
  };

  return (
    <div>
      <div className="checkbox-wrapper">
        <label className="switch">
          <input
            className="switch-input"
            type="checkbox"
            id="eraseCheckbox"
            onChange={(e) => handleCheck(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
        <label className="switch-label"> {title} </label>
      </div>
      {isChecked && children && (
        <div className="checkbox-children">{children}</div>
      )}
    </div>
  );
};
