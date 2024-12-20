import React from "react";
import "./VerificationFailed.scss";
import { Button } from "../../components/shared/Button/Button";
import errorIcon from "../../../assets/icons/close-dark.svg";
import { useMutation } from "@tanstack/react-query";
import { resetVerificationRequest } from "../../services/user.service";

export const VerificationFailed = (): React.JSX.Element => {
  const [error, setError] = React.useState<string>();
  const verificationResetMutation = useMutation({
    mutationFn: resetVerificationRequest,
    onSuccess: (response) => {
      if (response?.error || response?.message) {
        setError(response?.message || response?.error);
        return;
      } else {
        window.location.reload();
      }
    },
    onError: (error) => {
      setError(error?.message);
    },
  });
  const handleVerificationReset = () => {
    verificationResetMutation.mutate();
  };

  return (
    <div className="ColumnCenter VerificationFailed">
      <div className="GreyContainer ColumnCenter">
        <img src={errorIcon} width={64} alt="error" />
        <h3 className="Bold">Verification Failed</h3>
        <p>
          Your verification request was rejected. Please resubmit your data and
          try again
        </p>

        {error && <p className="Error">{error}</p>}

        <Button
          onClick={handleVerificationReset}
          isDisabled={verificationResetMutation.isPending}
        >
          Start Verification
        </Button>
      </div>
    </div>
  );
};
