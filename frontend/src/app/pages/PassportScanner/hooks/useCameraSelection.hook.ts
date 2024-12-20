import { useState, useEffect } from "react";
import { findBestCameraForDocs } from "../camera-utils";

export const useCameraSelection = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const selectBestCamera = async () => {
      const bestCamera = await findBestCameraForDocs();
      if (bestCamera) {
        setSelectedDeviceId(bestCamera.deviceId);
      }
    };

    const handleDeviceChange = () => {
      selectBestCamera();
    };

    selectBestCamera();
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, []);

  return selectedDeviceId;
};
