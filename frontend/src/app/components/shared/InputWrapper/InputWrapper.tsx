import React, { PropsWithChildren } from "react";
import "./InputWrapper.scss";

export interface InputWrapperProps {
  label?: string;
  placeholder?: string;
  markAsInvalid?: boolean;
}

export const InputWrapper = (
  props: PropsWithChildren<InputWrapperProps>
): React.JSX.Element => {
  const { label, markAsInvalid } = props;
  return (
    <div className="InputWrapper">
      <div className={`InputContent ${markAsInvalid ? "Invalid" : ""}`}>
        {label ? (
          <div className="LabelWrapper">
            <label>{label}</label>
          </div>
        ) : null}
        {props.children}
      </div>
    </div>
  );
};
