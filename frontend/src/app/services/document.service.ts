import { environment } from "../../environment";
import { UserResponse } from "../models/user.model";

export const getUser = async (): Promise<UserResponse | null> => {
  const response = await fetch(environment.backendUrl + "/user");

  return response.json();
};

export const createDocument = async (
  documentNumber: string
): Promise<UserResponse | null> => {
  const body = JSON.stringify({
    number: documentNumber,
  });
  return fetch(environment.backendUrl + "/document", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
};

export const getDocumentForUser = async (): Promise<UserResponse | null> =>
  fetch(environment.backendUrl + "/document/my").then((response) =>
    response.json()
  );
