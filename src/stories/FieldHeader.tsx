import "./FieldHeader.css";
import React from "react";
import { InfoBox } from "./InfoBox";

interface FieldHeaderProps {
  infoText?: string;
  title: string;
  children: React.ReactNode;
}

export const FieldHeader: React.FC<FieldHeaderProps> = ({
  title = "",
  infoText = "",
  children,
}) => {
  const info = <InfoBox infoText={infoText}></InfoBox>;

  return (
    <div>
      <div className="field-header">
        {title}
        {infoText !== "" && info}
      </div>
      <div className="field-children">{children}</div>
    </div>
  );
};
