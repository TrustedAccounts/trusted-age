import React, { useState } from "react";
import "./DocumentUpload.scss";
import idCard from "../../../assets/icons/id-card.svg";
import shield from "../../../assets/icons/shield.svg";
import camera from "../../../assets/icons/camera-white.svg";
import { Button } from "../../components/shared/Button/Button";
import { FileUpload } from "../../components/shared/FileUpload/FileUpload";
import { useMutation } from "@tanstack/react-query";
import { verifyPassport } from "../../services/passport-verification.service";
import PassportScanner from "../PassportScanner/passport-scanner";
import { Link } from "react-router-dom";
import warning from "../../../assets/icons/warning-circle-orange.svg";

export type DocumentUploadProps = {
  goToPreviousStep: () => void;
  documentVerified?: (file: File | null) => void;
};

export const DocumentUpload = (
  props: DocumentUploadProps
): React.JSX.Element => {
  const { goToPreviousStep } = props;
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [openScanner, setOpenScanner] = useState(false);

  const isErrorDuplicate = (message: string) =>
    message.startsWith("DOCUMENT_ALREADY_EXISTS");

  const passportVerificationRequest = useMutation({
    mutationFn: verifyPassport,
    onSuccess: (data) => {
      if (data.statusCode && data.statusCode !== 200) {
        // todo: error handling
        setError(data.message);
        return;
      }

      if (data.status === "REJECTED") {
        setError("Your document verification did not succeed");
        return;
      }

      props.documentVerified && props.documentVerified(file);
    },
    onError: (error) => {
      setError(error?.message || "Failed to upload document");
    },
  });

  const { isPending } = passportVerificationRequest;

  const handleDocumentPhoto = (file: File | null) => {
    setFile(file);
    setError(null);
    passportVerificationRequest.mutate(file);
  };

  const handlePhotoCaptured = (photo: File) => {
    handleDocumentPhoto(photo);
    setOpenScanner(false);
  };

  return openScanner ? (
    <PassportScanner
      closeScanner={() => setOpenScanner(false)}
      photoCaptured={handlePhotoCaptured}
    />
  ) : (
    <>
      <div className="DocumentUpload ColumnCenterSpaceBetween">
        <div
          className="GreyContainer RowCenter CardPlaceholder"
          style={
            file
              ? {
                  backgroundImage: `url(${URL.createObjectURL(file)})`,
                }
              : {}
          }
        >
          {file ? null : <img src={idCard} width={130} alt="ID card" />}
        </div>

        <div className="GreyContainer Column PrivacyInfo">
          <p>
            Choose if you want to take or upload an image of your ID document.
          </p>
          <div className="Divider"></div>
          <div className="Row">
            <img src={shield} width={20} height={20} alt="Schield" />
            <div className="PrivacyTextBox">
              <p className="Bold">Full privacy</p>
              <p>We will fully anonymise all your data.</p>
            </div>
          </div>
        </div>

        {error ? (
          <>
            {isErrorDuplicate(error) ? (
              <div className="Info RowCenter">
                <img src={warning} alt="warning" />
                <p>
                  This document has already been uploaded. Do you want to{" "}
                  <Link to={"https://my.trustedaccounts.org/"}>login</Link>{" "}
                  instead?
                </p>
              </div>
            ) : (
              <div className="Error">{error}</div>
            )}
          </>
        ) : null}

        <div className="ColumnActions">
          <Button onClick={() => setOpenScanner(true)} isDisabled={isPending}>
            <img src={camera} width={32} height={32} alt="camera" />
          </Button>
          <FileUpload
            onFileUpload={handleDocumentPhoto}
            onError={console.error}
            isDisabled={isPending}
          >
            {isPending ? "Uploading..." : "Upload"}
          </FileUpload>
          <Button
            style="secondary"
            onClick={goToPreviousStep}
            isDisabled={isPending}
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};
