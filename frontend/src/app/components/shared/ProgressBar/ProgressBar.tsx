import React from "react";
import "./ProgressBar.scss";

export const ProgressBar = (props: {
  label: string;
  total: number;
  current: number;
}): React.JSX.Element => {
  const { total, current, label } = props;
  const progressPercent = ((current + 1) / total) * 100;
  return (
    <div className="ProgressBar Column">
      <div className="Bar">
        <div
          className="Progress"
          style={{ width: progressPercent + "%" }}
        ></div>
      </div>
      <div className="Label">
        <span className="Bold Count">{current + 1}</span>
        <span>{label}</span>
      </div>
    </div>
  );
};
