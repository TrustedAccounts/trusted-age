import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { usePassportScanner } from "./hooks/usePassportScanner.hook";
import "./PassportScanner.scss";
import idCard from "../../../assets/icons/id-card.svg";
import close from "../../../assets/icons/close.svg";
import { CaptureSuccess } from "./components/CaptureSuccess/CaptureSuccess";
import { OpenCvProvider } from "opencv-react-ts";
import { Button } from "../../components/shared/Button/Button";
import { useBlurredFrame } from "./hooks/useBlurredFrame.hook";

type PassportScannerProps = {
  closeScanner: () => void;
  photoCaptured: (file: File) => void;
};

export const PassportScanner = ({
  closeScanner,
  photoCaptured,
}: PassportScannerProps) => {
  const {
    webcamRef,
    canvasRef,
    capturedImage,
    statusMessage,
    handleRetry,
    videoConstraints,
    selectedDeviceId,
  } = usePassportScanner();

  const { blurredFrameRef, blurredFrameRect, updateRect } = useBlurredFrame();

  const [computedBlurredFrameTop, setComputedBlurredFrameTop] = useState("0px");
  const [computedBlurredFrameLeft, setComputedBlurredFrameLeft] =
    useState("0px");

  useEffect(() => {
    if (blurredFrameRect) {
      setComputedBlurredFrameTop(`${blurredFrameRect.top}px`);
      setComputedBlurredFrameLeft(`${blurredFrameRect.left}px`);
    }
  }, [blurredFrameRect]);

  return (
    <div className="PassportScanner RowCenter">
      <OpenCvProvider>
        {selectedDeviceId ? (
          <>
            {capturedImage ? (
              <CaptureSuccess
                capturedFile={capturedImage}
                handleRetry={handleRetry}
                handleNext={() => photoCaptured(capturedImage)}
              />
            ) : (
              <div className="webcam-container RowCenter">
                <Button
                  style="ghost"
                  onClick={closeScanner}
                  styles={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    zIndex: 1,
                    width: "unset",
                    minHeight: "unset",
                    padding: "8px",
                  }}
                >
                  <img src={close} width={24} alt="close" />
                </Button>
                <div
                  style={{
                    maxHeight: "100dvh",
                    overflow: "hidden",
                  }}
                >
                  <Webcam
                    onUserMedia={() => {
                      updateRect();
                    }}
                    width={"100%"}
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                  />
                </div>
                <div className="scanner-instructions absolute-center RowCenter">
                  <p>{statusMessage}</p>
                </div>
                <div
                  className="picture-frame-container absolute-center RowCenter"
                  style={{
                    borderTopWidth: computedBlurredFrameTop,
                    borderBottomWidth: computedBlurredFrameTop,
                    borderLeftWidth: computedBlurredFrameLeft,
                    borderRightWidth: computedBlurredFrameLeft,
                  }}
                >
                  <div className="frame" ref={blurredFrameRef}>
                    <div className="frame-border-animation"></div>
                    <div className="bottom-info RowCenter">
                      <div
                        className="id-image"
                        style={{ backgroundImage: `url(${idCard})` }}
                      />
                      <p>
                        Legen Sie die Vorderseite Ihres Ausweises in den Rahmen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                border: "1px solid red",
                width: "1080px",
                top: "20px",
                transform: "scale(0.1)",
                transformOrigin: "top",
                visibility: "hidden",
              }}
            />
          </>
        ) : (
          <p>Loading camera...</p>
        )}
      </OpenCvProvider>
    </div>
  );
};

export default PassportScanner;
