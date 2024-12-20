import React from "react";
import "./VerificationPending.scss";
import clock from "../../../assets/icons/clock.svg";

export const VerificationPending = (): React.JSX.Element => {
  return (
    <div className="ColumnCenterSpaceBetween">
      <div className="SectionHeader">
        <img src={clock} height={48} width={48} alt="clock icon" />
        <h1>Verification Pending</h1>
        <p>
          Our team needs to review your documents before verification is
          completed. This process is currently conducted manually and may take
          1-2 business days to complete.
        </p>
      </div>
    </div>
  );
};
