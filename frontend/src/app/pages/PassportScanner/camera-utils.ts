type DeviceWithCapabilities = {
  device: MediaDeviceInfo;
  capabilities: MediaTrackCapabilities;
};

export const findBestCameraForDocs = async (): Promise<
  MediaDeviceInfo | undefined
> => {
  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = allDevices.filter(
      (device) => device.kind === "videoinput"
    );

    const environmentCameras: DeviceWithCapabilities[] = [];

    for (const device of videoDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: device.deviceId },
      });
      const track = stream.getVideoTracks()[0];
      const capabilities: MediaTrackCapabilities = track.getCapabilities();

      if (
        capabilities.facingMode &&
        capabilities.facingMode.includes("environment")
      ) {
        environmentCameras.push({ device, capabilities });
      }

      track.stop(); // Stop the track to release the camera
    }

    const candidateCameras =
      environmentCameras.length > 0
        ? environmentCameras
        : videoDevices.map((device) => ({
            device,
            capabilities: {} as MediaTrackCapabilities,
          }));

    // Sort the cameras by resolution (width * height) in descending order
    const sortedCameras = candidateCameras.sort((a, b) => {
      const resolutionA =
        (a.capabilities?.width?.max || 1) * (a.capabilities?.height?.max || 1);
      const resolutionB =
        (b.capabilities?.width?.max || 1) * (b.capabilities?.height?.max || 1);
      return (resolutionB || 0) - (resolutionA || 0); // Sort descending by resolution
    });

    console.log("Sorted cameras:", sortedCameras);

    // Return the camera with the highest resolution
    return sortedCameras[0]?.device;
  } catch (error) {
    console.error("Error finding the best camera: ", error);
    return undefined;
  }
};
