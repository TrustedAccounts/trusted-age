import { Header } from "../../../../components/shared/Header/Header";
import shield from "../../../../../assets/icons/check-blue.svg";
import { Button } from "../../../../components/shared/Button/Button";
import { Footer } from "../../../../components/shared/Footer/Footer";
import React, { useEffect, useState } from "react";
import "./CaptureSuccess.scss";

type CaptureSuccessProps = {
  capturedFile: File;
  handleRetry: () => void;
  handleNext: (file: File | null) => void;
};

export const CaptureSuccess = ({
  capturedFile,
  handleNext,
  handleRetry,
}: CaptureSuccessProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (capturedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(capturedFile);
    }
  }, [capturedFile]);

  return (
    <div className="captured-image-container Column">
      <Header />

      <div className="captured-image-content Column">
        <div className="title">
          <img src={shield} width={60} height={60} alt="Schield" />
          <h1>Capture successful</h1>
        </div>
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            className="result"
            alt="Scanned ID"
            style={{ width: "100%", maxWidth: "400px" }}
          />
        ) : (
          <></>
        )}

        <div className="actions Column">
          <Button onClick={() => handleNext(capturedFile)}>Next</Button>
          <Button style="outlined" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};
