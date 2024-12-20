import React from "react";
import "./VerifiedCard.scss";
import logo from "../../../../assets/icons/truested-logo-white.svg";
import check from "../../../../assets/icons/check.svg";

export const VerifiedCard = (): React.JSX.Element => {
  return (
    <div className="VerifiedCardContainer Column">
      <img src={logo} width={95} alt="logo" />
      <div className="VerifiedCardContent ColumnCenter">
        <img src={check} width={94} height={94} alt="check" />
        <p>Anonymous</p>
        <h3 className="Bold">Verified Human</h3>
      </div>
      <div className="VerifiedCardFooter Row">
        <img src={check} width={20} height={20} alt="check" />
        <div>
          <p className="Bold Count">Level 2</p>
          <p>ID / Passport</p>
        </div>
      </div>
    </div>
  );
};
