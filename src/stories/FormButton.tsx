import "./FormButton.css";
import React, { MouseEventHandler } from "react";

interface FormButtonProps {
  style: "Next" | "Back" | "Submit";
  onClickFun: MouseEventHandler<HTMLButtonElement>;
}

export const FormButton: React.FC<FormButtonProps> = ({
  style,
  onClickFun = () => {},
}) => {
  return (
    <button className={`btn-${style.toLowerCase()}`} onClick={onClickFun}>
      {style}
    </button>
  );
};
