import "./DropDownButton.css";
import React, { useState, useEffect } from "react";
import { InfoBox } from "../InfoBox/InfoBox";
import {
  faChevronCircleDown,
  faChevronCircleUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DropDownButtonProps {
  infoText?: string;
  primary?: boolean;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  hasIcon: boolean;
  isSelected: boolean;
  onActivate: () => void;
  activeText?: string;
}

export const DropDownButton: React.FC<DropDownButtonProps> = ({
  title = "",
  infoText = "",
  children,
  primary = true,
  isActive = false,
  activeText = "",
  hasIcon = false,
  isSelected = false,

  onActivate = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  const toggleDropdown = () => {
    if (!isOpen) {
      onActivate();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button
        className={`dropbtn--${primary ? "primary" : "secondary"} ${isOpen ? "active" : ""} ${isSelected ? "selected" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="title">{title}</div>
        <div className="activeText">{activeText}</div>
        {/*<div className="activeText"><p>{activeText}</p></div>*/}
        {infoText && <InfoBox className="icon" infoText={infoText} />}
        {hasIcon && !isOpen && <FontAwesomeIcon className="icon" icon={faChevronCircleDown} />}
        {hasIcon && isOpen && <FontAwesomeIcon className="icon" icon={faChevronCircleUp} />}
      </button>
      {isOpen && <div className="dropdown-content">{children}</div>}
    </div>
  );
};

interface DropDownOptionProps {
  index: number;
  activeIndex: number;
  title: string;
  onSelect: (title, index) => void;
}

export const DropDownOption: React.FC<DropDownOptionProps> = ({
  title,
  index,
  activeIndex,
  onSelect,
}) => {
  const isActive = activeIndex === index;
  const [isSelected, setIsSelected] = useState(isActive);

  useEffect(() => {
    setIsSelected(isActive);
  }, [isActive]);

  const handleSelect = () => {
    if (!isSelected) {
      onSelect(title, index);
    }
  };

  return (
    <a
      className={`dropdown--option${isSelected ? "--active" : ""}`}
      onClick={handleSelect}
    >
      {title}
    </a>
  );
};
