import React, { useState } from "react";
import "./InfoBox.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

interface InfoBoxProps {
  infoText: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ infoText }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
      <div
      className="info-icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FontAwesomeIcon icon={faQuestionCircle} />
      {isHovered && <div className="info-text">{infoText}</div>}
    </div>
  );
};
