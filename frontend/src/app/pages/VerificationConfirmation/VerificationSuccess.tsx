import React, { useEffect } from "react";
import "./VerificationConfirmation.scss";
import shield from "../../../assets/icons/shield.svg";
import logoShort from "../../../assets/icons/trusted-logo-short.svg";
import { Button } from "../../components/shared/Button/Button";
import { VerifiedCard } from "../../components/shared/VerifiedCard/VerifiedCard";
import { getSecondaryToken } from "../../services/user.service";

export type VerificationConfirmationProps = {
  goToPreviousStep: () => void;
  companyName: string;
};

export const VerificationSuccess = (
  props: VerificationConfirmationProps
): React.JSX.Element => {
  const { goToPreviousStep, companyName } = props;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        await getSecondaryToken();
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  return (
    <div className="ColumnCenterSpaceBetween">
      <VerifiedCard />

      <div className="GreyContainer Column PrivacyInfo">
        <p>
          Third parties can now verify you are over 18 years old. You can now close this window.
        </p>
        <div className="Divider"></div>
        <div className="Row">
          <img src={shield} width={20} height={20} alt="Shield" />
          <div className="PrivacyTextBox">
            <p className="Bold">Full privacy</p>
            <p>No personal data is shared with {companyName}.</p>
          </div>
        </div>
      </div>

      <div className="ColumnActions">
        {/* <Button onClick={() => {}}>
          <img width={24} height={24} src={logoShort} alt="Logo" />
          Verified with Trusted
        </Button> */}
      </div>
    </div>
  );
};
