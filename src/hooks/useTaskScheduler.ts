import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "./api";
import type { ApiResponse } from "../types/apiType";
import type { Task } from "../types/taskSchedulerType";

//  Get all tasks
const useGetAllTasks = (page: number = 1, limit: number = 10) => {
  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  }: UseQueryResult<ApiResponse<Task[]>, Error> = useQuery({
    queryKey: ["get-all-tasks", page, limit],
    queryFn: async () => {
      const response = await apiClient.get("/user/tasks", {
        params: { page, limit },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  return { allTasks: data, isLoading, isFetching, error, refetch };
};

//  Get task by ID
const useGetTaskById = (taskId: string | undefined) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  }: UseQueryResult<ApiResponse<Task>, Error> = useQuery({
    queryKey: ["get-task-by-id", taskId],
    queryFn: async () => {
      const response = await apiClient.get(`/user/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });
  return { task: data, isLoading, error, refetch };
};

// Delete task (only toggle active, not removed the actual data from DB)
const useDeleteTask = () => {
  const {
    mutate,
    data,
    isPending,
    error,
  }: UseMutationResult<ApiResponse<Task>, Error, { taskId: string }> = useMutation({
    mutationKey: ["delete-task"],
    mutationFn: async ({ taskId }) => {
      const response = await apiClient.delete(`/user/tasks/${taskId}`);
      return response.data;
    },
  });

  return { deleteTask: mutate, data, isLoading: isPending, error };
};

export { useGetAllTasks, useGetTaskById, useDeleteTask };
