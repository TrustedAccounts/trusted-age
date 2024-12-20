import { UserStep } from "../../models/user.model";

const verificationStepOrder = [
  UserStep.COUNTRY_VERIFICATION,
  UserStep.PASSPORT_VERIFICATION,
  UserStep.LIVENESS_VERIFICATION,
  UserStep.VERIFICATION_PENDING,
  UserStep.VERIFICATION_SUCCESS,
];

export interface VerificationStep {
  label: string;
  index: number;
  path: string;
  step: UserStep;
}

const excludedSteps = [
  UserStep.EMAIL_VERIFICATION,
  UserStep.PHONE_VERIFICATION,
];

export const verificationSteps: Record<UserStep, VerificationStep> = {
  [UserStep.EMAIL_VERIFICATION]: {
    label: "",
    index: 0,
    path: "/",
    step: UserStep.EMAIL_VERIFICATION,
  },
  [UserStep.PHONE_VERIFICATION]: {
    label: "",
    index: 0,
    path: "/",
    step: UserStep.PHONE_VERIFICATION,
  },
  [UserStep.COUNTRY_VERIFICATION]: {
    label: "Country",
    index: 0,
    path: "/verification/country",
    step: UserStep.COUNTRY_VERIFICATION,
  },
  [UserStep.PASSPORT_VERIFICATION]: {
    label: "ID / Passport",
    index: 1,
    path: "/verification/passport",
    step: UserStep.PASSPORT_VERIFICATION,
  },
  [UserStep.LIVENESS_VERIFICATION]: {
    label: "Liveness Check",
    index: 2,
    path: "/verification/liveness",
    step: UserStep.LIVENESS_VERIFICATION,
  },
  [UserStep.VERIFICATION_PENDING]: {
    label: "Verification Pending",
    index: 3,
    path: "/verification/pending",
    step: UserStep.VERIFICATION_PENDING,
  },
  [UserStep.VERIFICATION_SUCCESS]: {
    label: "Verification Confirmation",
    index: 4,
    path: "/verification/success",
    step: UserStep.VERIFICATION_SUCCESS,
  },
  [UserStep.VERIFICATION_FAILED]: {
    label: "Verification Failed",
    index: 4,
    path: "/verification/failed",
    step: UserStep.VERIFICATION_FAILED,
  },
};

export const verificationStepsCount = verificationStepOrder.length;

export const firstStepPath =
  verificationSteps[UserStep.COUNTRY_VERIFICATION].path;

export const lastStepPath =
  verificationSteps[UserStep.VERIFICATION_SUCCESS].path;

export const getNextStep = (activeStep: UserStep | null): UserStep | null => {
  switch (activeStep) {
    case UserStep.COUNTRY_VERIFICATION:
      return UserStep.PASSPORT_VERIFICATION;
    case UserStep.PASSPORT_VERIFICATION:
      return UserStep.LIVENESS_VERIFICATION;
    case UserStep.LIVENESS_VERIFICATION:
      return UserStep.VERIFICATION_PENDING;
    default:
      return null;
  }
};

export const getStepDetails = (
  step: UserStep | null
): VerificationStep | null => {
  if (!step) return null;
  return verificationSteps[step] || null;
};

export const getPreviousStep = (
  activeStep: UserStep | null
): UserStep | null => {
  switch (activeStep) {
    case UserStep.PASSPORT_VERIFICATION:
      return UserStep.COUNTRY_VERIFICATION;
    case UserStep.LIVENESS_VERIFICATION:
      return UserStep.PASSPORT_VERIFICATION;
    case UserStep.VERIFICATION_SUCCESS:
      return UserStep.LIVENESS_VERIFICATION;
    default:
      return null;
  }
};

export const getNextStepPath = (activeStep: UserStep | null): string => {
  const nextStep = getNextStep(activeStep);
  const nextStepDetails = getStepDetails(nextStep);
  return nextStepDetails?.path || "/";
};

export const getPreviousStepPath = (activeStep: UserStep | null): string => {
  const previousStep = getNextStep(activeStep);
  const previousStepDetails = getStepDetails(previousStep);
  return previousStepDetails?.path || "/";
};
