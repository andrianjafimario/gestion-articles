import { apiClient } from "./apiClient";
import type { ApiResponse, Category } from "../types/entities";

export interface CategoryPayload {
  name: string;
  slug: string;
  description: string;
  color: string;
}

export async function listCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const response = await apiClient.post<ApiResponse<Category>>("/categories", payload);
  return response.data.data;
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
  const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<Category> {
  const response = await apiClient.delete<ApiResponse<Category>>(`/categories/${id}`);
  return response.data.data;
}
