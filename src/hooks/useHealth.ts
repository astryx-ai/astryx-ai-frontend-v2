import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./api";

const useHealth = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await apiClient.get("/health");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, error };
};

export default useHealth;
