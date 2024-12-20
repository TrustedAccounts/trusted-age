import React from "react";
import { Select } from "../Select/Select";
import { COUNTRIES } from "./countries";
import { CountryCode } from "../../../models/user.model";

export const CountryDropdown = (props: {
  markAsInvalid?: boolean;
  country?: CountryCode | null;
  onCountryChange: (value: CountryCode) => void;
}): React.JSX.Element => {
  return (
    <Select
      label="Select country"
      placeholder="Select country"
      value={props.country}
      markAsInvalid={props.markAsInvalid}
      onChange={props.onCountryChange}
      options={COUNTRIES}
    />
  );
};
