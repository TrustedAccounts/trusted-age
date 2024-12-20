import { environment } from "../../environment";
import {
  DocumentType,
  UserCountryResponse,
  UserResponse,
  UserStepResponse,
  CountryCode,
} from "../models/user.model";

export interface UpdateUserCountryDto {
  country_code?: CountryCode;
  document_type?: DocumentType;
}

// Fetch the current user details
export const getUser = async (): Promise<UserResponse | null> => {
  const response = await fetch(environment.backendUrl + "/user");

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<UserResponse>;
};

// Fetch the current user step in the verification process
export const getUserStep = async (): Promise<UserStepResponse> => {
  const response = await fetch(environment.backendUrl + "/user/step");

  if (!response.ok) {
    throw new Error("Failed to fetch user step"); // Handle error cases appropriately
  }

  return response.json() as Promise<UserStepResponse>;
};

export const getPendingUsers = async (): Promise<UserResponse[]> => {
  const response = await fetch(environment.backendUrl + "/admin/users");

  return response.json();
};

export const getPassportImageData = async (
  userId: string
): Promise<{
  faceImage: string;
  passportImage: string;
} | null> => {
  return fetch(environment.backendUrl + `/admin/users/${userId}/docs`).then(
    (response) => response.json()
  );
};

export const updateUserRequest = async ({
  userId,
  approved,
}: {
  userId: string;
  approved: boolean;
}) => {
  const pathSuffix = approved ? "approve" : "reject";
  return fetch(
    environment.backendUrl + `/admin/users/${userId}/${pathSuffix}`,
    {
      method: "POST",
    }
  ).then((response) => response.json());
};

export const getSecondaryToken = async (): Promise<{ token: string }> => {
  const response = await fetch(environment.backendUrl + "/auth/token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch token");
  }

  return response.json();
};

// Fetch the current user's country
export const getUserCountryDocument =
  async (): Promise<UserCountryResponse> => {
    const response = await fetch(
      environment.backendUrl + "/user/country-document"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user country"); // Handle error cases appropriately
    }

    return response.json() as Promise<UserCountryResponse>;
  };

// Update the user's country code
export const updateUserCountryDocument = async ({
  countryCode,
  documentType,
}: {
  countryCode: CountryCode;
  documentType: DocumentType;
}): Promise<UserResponse | null> => {
  const body: UpdateUserCountryDto = {
    country_code: countryCode,
    document_type: documentType,
  };

  const response = await fetch(
    environment.backendUrl + "/user/country-document",
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    return null; // Handle error cases appropriately
  }

  return response.json() as Promise<UserResponse>;
};

export const resetVerificationRequest = async () => {
  return fetch(environment.backendUrl + `/user/reset-verification`, {
    method: "POST",
  }).then((response) => response.json());
};
