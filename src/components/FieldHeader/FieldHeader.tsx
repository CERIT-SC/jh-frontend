import "./FieldHeader.css";
import React from "react";
import { InfoBox } from "../InfoBox/InfoBox";

interface FieldHeaderProps {
  infoText?: string;
  title: string;
  activeText?: string;
  children: React.ReactNode;
}

export const FieldHeader: React.FC<FieldHeaderProps> = ({
  title = "",
  infoText = "",
  activeText= "",
  children,
}) => {
  const info = <InfoBox infoText={infoText}></InfoBox>;

  return (
    <div>
      <div className="field-header">
      <div className="title"><p>{title}</p></div>
      <div className="activeText"><p>{activeText}</p></div>
      <div className="infoText"><p>{infoText !== "" && info}</p></div>

          {/*{activeText}*/}
      </div>
      <div className="field-children">{children}</div>
    </div>
  );
};
