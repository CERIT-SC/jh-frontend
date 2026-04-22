import React, { MouseEventHandler } from "react";
import { Button as EinfraButton } from "@e-infra/design-system";

type ButtonVariant =
  | "default"
  | "error"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "tertiary"
  | "info"
  | "success"
  | "warning";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  link?: string;
  onClickFun?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  title = "",
  link,
  onClickFun = () => {},
  disabled = false,
  className = "w-full",
  ...props
}) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (link) {
      window.location.href = link;
    } else if (onClickFun) {
      onClickFun(e);
    }
  };

  return (
    <EinfraButton
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {title} {props.children}
    </EinfraButton>
  );
};

export type { ButtonVariant, ButtonSize };
