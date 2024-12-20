import { environment } from "../../environment";

export interface LivenessSessionResponse {
  status: string;
  sessionId: string;
}

export interface LivenessSessionResultResponse {
  status: string;
  isLive: boolean;
}

// Create a new liveness session
export const createLivenessSession =
  async (): Promise<LivenessSessionResponse> => {
    const response = await fetch(environment.backendUrl + "/liveness-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create liveness session");
    }

    return response.json();
  };

// Get the results of a liveness session by sessionId
export const getLivenessSessionResults = async (
  sessionId: string
): Promise<LivenessSessionResultResponse> => {
  const response = await fetch(
    `${environment.backendUrl}/liveness-check?sessionId=${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get liveness session results");
  }

  return response.json();
};
