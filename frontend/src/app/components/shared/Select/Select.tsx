import React, { PropsWithChildren, useEffect } from "react";
import { InputWrapper, InputWrapperProps } from "../InputWrapper/InputWrapper";

export type SelectOptionType = string | number | null;

export type SelectOption<T> = {
  label: string;
  value: T | null;
  flag?: string;
};

export interface SelectProps<T extends SelectOptionType>
  extends InputWrapperProps {
  onChange: (value: T) => void;
  value?: T | null;
  options: SelectOption<T>[];
}

export const Select = <T extends SelectOptionType>(
  props: PropsWithChildren<SelectProps<T>>
): React.JSX.Element => {
  const { options, placeholder, onChange, ...wrapperProps } = props;
  const optionsList = options.map((option) => (
    <option key={option.value?.toString()} value={option.value || undefined}>
      {option.label} {option.flag}
    </option>
  ));

  useEffect(() => {
    if (props.value) {
      onChange(props.value);
    }
  }, [props.value]);
  return (
    <InputWrapper {...wrapperProps}>
      <select
        defaultValue={props.value || ""}
        onChange={(ev) => onChange(ev?.target?.value as T)}
      >
        {placeholder ? (
          <option value={""} disabled>
            {placeholder}
          </option>
        ) : null}
        {optionsList}
      </select>
    </InputWrapper>
  );
};
