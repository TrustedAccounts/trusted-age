import React from "react";
import { Select } from "../Select/Select";
import { DocumentTypes } from "./documentTypes";
import { DocumentType } from "../../../models/user.model";

export const DocumentTypeDropdown = (props: {
  markAsInvalid?: boolean;
  type?: DocumentType | null;
  onTypeChange: (value: DocumentType) => void;
}): React.JSX.Element => {
  return (
    <Select
      label="Select document type"
      placeholder=" "
      value={props.type}
      markAsInvalid={props.markAsInvalid}
      onChange={props.onTypeChange}
      options={DocumentTypes}
    />
  );
};
