import React, { PropsWithChildren } from "react";
import "./Button.scss";

export type ButtonProps = {
  style?: "cta" | "secondary" | "outlined" | "ghost";
  styles?: React.CSSProperties;
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
};

export const Button = ({
  style = "cta",
  onClick,
  children,
  isDisabled,
  styles,
  className,
}: PropsWithChildren<ButtonProps>): React.JSX.Element => {
  return (
    <button
      className={`Button RowCenter Bold ${style} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      style={styles}
    >
      {children}
    </button>
  );
};
