import { environment } from "../../environment";

export const verifyPassport = async (documentImage: File | null) => {
  const formData = new FormData();
  formData.append("file", documentImage || "");
  const response = await fetch(
    environment.backendUrl + "/passport-verification/analyze-passport",
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
};
