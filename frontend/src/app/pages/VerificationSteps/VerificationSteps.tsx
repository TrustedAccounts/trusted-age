import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserStep } from "../../services/user.service";
import { UserStep, UserStepResponse } from "../../models/user.model";
import { ProgressBar } from "../../components/shared/ProgressBar/ProgressBar";
import {
  firstStepPath,
  getNextStep,
  getPreviousStep,
  getStepDetails,
  VerificationStep,
  verificationSteps,
  verificationStepsCount,
} from "./verification-steps.utils";
import { DocumentUpload } from "../DocumentUpload/DocumentUpload";
import { LivenessCheck } from "../LivenessCheck/liveness-check";
import { VerificationSuccess } from "../VerificationConfirmation/VerificationSuccess";
import { IdPassportVerification } from "../IdPassportVerification/IdPassportVerification";
import { VerificationPending } from "../VerificationPending/VerificationPending";
import { VerificationFailed } from "../VerificationFailed/VerificationFailed";

export const VerificationSteps = (): React.JSX.Element => {
  const navigate = useNavigate();

  const {
    data: userStep,
    isLoading,
    isFetched,
  } = useQuery<UserStepResponse | null, Error>({
    queryKey: ["getUserStep"],
    queryFn: getUserStep,
    enabled: true,
  });

  const [currentStepDetails, setCurrentStepDetails] =
    useState<VerificationStep | null>(null);

  useEffect(() => {
    if (isLoading || !isFetched) {
      return;
    }

    const stepDetails = getStepDetails(userStep?.step || null);
    setCurrentStepDetails(stepDetails);
  }, [userStep, isLoading, isFetched]);

  useEffect(() => {
    if (!currentStepDetails) {
      return;
    }

    if (
      currentStepDetails.step === UserStep.EMAIL_VERIFICATION ||
      currentStepDetails.step === UserStep.PHONE_VERIFICATION
    ) {
      window.location.href = "https://my.trustedaccounts.org/";
      return;
    }

    if (currentStepDetails?.path) {
      navigate(currentStepDetails.path, { replace: true });
    } else {
      navigate(firstStepPath, { replace: true });
    }
  }, [currentStepDetails, navigate]);

  const goToPreviousStep = () =>
    setCurrentStepDetails(
      getStepDetails(getPreviousStep(currentStepDetails?.step || null))
    );
  const goToNextStep = () =>
    setCurrentStepDetails(
      getStepDetails(getNextStep(currentStepDetails?.step || null))
    );

  return isLoading || !currentStepDetails ? (
    <></>
  ) : (
    <>
      {currentStepDetails?.step !== UserStep.VERIFICATION_SUCCESS &&
      currentStepDetails?.step !== UserStep.VERIFICATION_FAILED ? (
        <ProgressBar
          current={currentStepDetails.index}
          label={currentStepDetails.label}
          total={verificationStepsCount}
        />
      ) : null}

      <Routes>
        <Route
          path={verificationSteps[UserStep.COUNTRY_VERIFICATION].path}
          element={
            <IdPassportVerification
              goToPreviousStep={goToPreviousStep}
              countryCodeSaved={goToNextStep}
            />
          }
        />
        <Route
          path={verificationSteps[UserStep.PASSPORT_VERIFICATION].path}
          element={
            <DocumentUpload
              documentVerified={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          }
        />
        <Route
          path={verificationSteps[UserStep.LIVENESS_VERIFICATION].path}
          element={
            <LivenessCheck
              onVerificationComplete={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          }
        />
        <Route
          path={verificationSteps[UserStep.VERIFICATION_PENDING].path}
          element={<VerificationPending />}
        />
        <Route
          path={verificationSteps[UserStep.VERIFICATION_SUCCESS].path}
          element={
            <VerificationSuccess
              goToPreviousStep={goToPreviousStep}
              companyName="Example Co"
            />
          }
        />
        <Route
          path={verificationSteps[UserStep.VERIFICATION_FAILED].path}
          element={<VerificationFailed />}
        />
        <Route path="*" element={<Navigate to={firstStepPath} replace />} />
      </Routes>
    </>
  );
};
