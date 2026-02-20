import { apiClient } from "./apiClient";
import type { ApiResponse, EmailNotification } from "../types/entities";

export async function listNotifications(limit = 50): Promise<EmailNotification[]> {
  const response = await apiClient.get<ApiResponse<EmailNotification[]>>("/notifications", {
    params: { limit },
  });
  return response.data.data;
}
