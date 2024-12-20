import { useQuery } from "@tanstack/react-query";
import { environment } from "../environment";

export interface HealthCheckResponse {
  status: string;
}

const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await fetch(environment.backendUrl + "/health-check");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json() as Promise<HealthCheckResponse>;
};

export const useHealthCheckController = () => {
  const { data, error, isLoading } = useQuery<HealthCheckResponse, Error>({
    queryKey: ["healthCheck"],
    queryFn: fetchHealthCheck,
  });

  return { data, error, isLoading };
};
