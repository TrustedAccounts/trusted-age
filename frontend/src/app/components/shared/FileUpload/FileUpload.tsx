import React, { PropsWithChildren } from "react";

export type FileUploadProps = {
  onFileUpload: (list: File | null) => void;
  onError?: (event: React.SyntheticEvent) => void;
  isDisabled?: boolean;
};

export const FileUpload = ({
  onFileUpload,
  onError,
  children,
  isDisabled,
}: PropsWithChildren<FileUploadProps>): React.JSX.Element => {
  return (
    <div className="RowCenter">
      <label className="Button RowCenter outlined" htmlFor="file">
        <span className="Bold">{children}</span>
      </label>
      <input
        type="file"
        id="file"
        name="file"
        accept="image/*, .heic"
        disabled={isDisabled}
        onChange={(ev) => {
          onFileUpload &&
            onFileUpload(ev?.target?.files ? ev?.target?.files[0] : null);
          ev.target.value = "";
        }}
        onError={(event) => onError && onError(event)}
        onErrorCapture={(event) => onError && onError(event)}
        style={{ position: "absolute", zIndex: -1, opacity: 0 }}
      />
    </div>
  );
};
