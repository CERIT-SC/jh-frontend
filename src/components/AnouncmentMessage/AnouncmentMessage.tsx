import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./AnouncmentMessage.css";

interface AnouncmentMessageProps {
  style: "warning" | "new";
  children: React.ReactNode;
}

const AnouncmentMessage: React.FC<AnouncmentMessageProps> = ({
  style,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    isVisible && (
      <div className={`message-${style}`}>
        <span className="close-btn" onClick={handleClose}>
          ✕
        </span>
        <div className="text-wrapper">
          <FontAwesomeIcon
            icon={style === "new" ? faStar : faExclamationTriangle}
            className="icon"
          />
          <div>{children}</div>
        </div>
      </div>
    )
  );
};

export default AnouncmentMessage;
