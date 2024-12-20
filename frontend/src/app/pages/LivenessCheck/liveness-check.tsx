import React, { useEffect } from "react";
import {
  AwsCredentialProvider,
  AwsCredentials,
  FaceLivenessDetectorCore,
} from "@aws-amplify/ui-react-liveness";
import { Loader, ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { environment } from "../../../environment";
import {
  createLivenessSession,
  getLivenessSessionResults,
} from "../../services/liveness-service";
import warning from "../../../assets/icons/warning-circle.svg";
import { Button } from "../../components/shared/Button/Button";
import "./LivenessCheck.scss";

type LivenessCheckProps = {
  onVerificationComplete: (isLive: boolean) => void;
  goToPreviousStep: () => void;
};

const credentialProvider: AwsCredentialProvider =
  async (): Promise<AwsCredentials> => ({
    accessKeyId: environment.rekognitionGuestAccessKey,
    secretAccessKey: environment.rekognitionGuestSecretKey,
  });

const WarningBanner = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="GreyContainer Row WarningBanner">
      <img src={warning} width={20} height={20} alt="warning" />
      <div className="InfoBox">
        <p className="Bold title">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  );
};

export const LivenessCheck: React.FC<LivenessCheckProps> = ({
  onVerificationComplete,
  goToPreviousStep,
}) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [verificationLoading, setVerificationLoading] =
    React.useState<boolean>(false);
  const [createLivenessApiData, setCreateLivenessApiData] = React.useState<{
    sessionId: string;
  } | null>(null);

  useEffect(() => {
    const fetchCreateLiveness = async (): Promise<void> => {
      try {
        const data = await createLivenessSession();
        setCreateLivenessApiData({ sessionId: data.sessionId });
      } catch (error) {
        console.error("Error creating liveness session", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreateLiveness();
  }, []);

  const handleAnalysisComplete = async (): Promise<void> => {
    if (createLivenessApiData === null) {
      console.error("No sessionId found");
      return;
    }

    try {
      setVerificationLoading(true);
      const data = await getLivenessSessionResults(
        createLivenessApiData.sessionId
      );

      setVerificationLoading(false);
      onVerificationComplete(data.isLive);
    } catch (error) {
      setVerificationLoading(false);
      console.error("Error fetching liveness session results", error);
    }
  };

  return (
    <ThemeProvider>
      {loading || !createLivenessApiData ? (
        <Loader />
      ) : (
        <div className="LivenessCheck ColumnCenterSpaceBetween">
          <FaceLivenessDetectorCore
            sessionId={createLivenessApiData.sessionId}
            region="eu-west-1"
            onAnalysisComplete={handleAnalysisComplete}
            components={{
              PhotosensitiveWarning: ({ headingText, infoText }: any) =>
                (
                  <WarningBanner title={headingText} description={infoText} />
                ) as any,
            }}
            onError={(error) => {
              console.error(error);
            }}
            config={{
              credentialProvider,
            }}
          />

          <div className="ColumnActions">
            <Button
              style="secondary"
              onClick={goToPreviousStep}
              isDisabled={verificationLoading}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};
