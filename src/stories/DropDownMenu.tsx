import React, { useState, useEffect } from "react";
import "./DropDownMenu.css";

export const DropDownMenu = ({
  menuOptions,
  title,
  formSelect,
  defaultOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultOption ? defaultOption[1] : title,
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue, name) => {
    setSelectedOption(name);
    setIsOpen(false);
    formSelect(optionValue);
  };

  useEffect(() => {
    if (defaultOption) {
      formSelect(defaultOption[0]);
    }
  }, []);

  return (
    <div className="dropdownmenu">
      <div
        className={`select-header ${selectedOption !== title ? "selected" : ""}`}
        onClick={toggleDropdown}
      >
        {selectedOption}
      </div>

      {isOpen && (
        <div className="select-options">
          {Object.entries(menuOptions).map(([key, name]) => (
            <div
              key={key}
              className="select-option"
              onClick={() => handleOptionClick(key, name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
