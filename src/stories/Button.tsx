import React, { MouseEventHandler } from "react";
import "./Button.css";

interface ButtonProps {
  primary?: boolean;
  title: string;
  link?: string;
  onClickFun?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title = "",
  link,
  primary = true,
  onClickFun = () => {},
  disabled = false,
}) => {
  return (
    <div className="btn">
      {link ? (
        <button
          className={`btn--${primary ? "primary" : "secondary"} ${disabled ? "btn--disabled" : ""}`}
          onClick={() => !disabled && (window.location.href = link)}
          disabled={disabled}
        >
          {title}
        </button>
      ) : (
        <button
          className={`btn--${primary ? "primary" : "secondary"} ${disabled ? "btn--disabled" : ""}`}
          onClick={(e) => !disabled && onClickFun(e)}
          disabled={disabled}
        >
          {title}
        </button>
      )}
    </div>
  );
};
