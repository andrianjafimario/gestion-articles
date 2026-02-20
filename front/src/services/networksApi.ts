import { apiClient } from "./apiClient";
import type { ApiResponse, Network } from "../types/entities";

export interface NetworkPayload {
  name: string;
  description: string;
}

export async function listNetworks(): Promise<Network[]> {
  const response = await apiClient.get<ApiResponse<Network[]>>("/networks");
  return response.data.data;
}

export async function createNetwork(payload: NetworkPayload): Promise<Network> {
  const response = await apiClient.post<ApiResponse<Network>>("/networks", payload);
  return response.data.data;
}

export async function updateNetwork(id: string, payload: Partial<NetworkPayload>): Promise<Network> {
  const response = await apiClient.put<ApiResponse<Network>>(`/networks/${id}`, payload);
  return response.data.data;
}

export async function deleteNetwork(id: string): Promise<Network> {
  const response = await apiClient.delete<ApiResponse<Network>>(`/networks/${id}`);
  return response.data.data;
}
