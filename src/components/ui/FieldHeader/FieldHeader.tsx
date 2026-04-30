import "./FieldHeader.css";
import React from "react";
import { InfoBox } from "@components/ui";

interface FieldHeaderProps {
  infoText?: string;
  title: string;
  activeText?: string;
  children: React.ReactNode;
}

export const FieldHeader: React.FC<FieldHeaderProps> = ({
  title = "",
  infoText = "",
  activeText = "",
  children,
}) => {
  return (
    <div>
      <div className="field-header">
        <div className="title">
          <p>{title}</p>
        </div>
        <div className="activeText">
          <p>{activeText}</p>
        </div>
        <div className="infoText">
          {infoText !== "" && (
            <InfoBox position="top">
              <p>{infoText}</p>
            </InfoBox>
          )}
        </div>
      </div>
      <div className="field-children">{children}</div>
    </div>
  );
};
