import { apiClient } from "./apiClient";
import type { ApiResponse, Article } from "../types/entities";
import type { CreateArticlePayload } from "./articlesApi";

export interface ImportResult {
  imported: number;
  articles: Article[];
}

export async function importArticles(payload: CreateArticlePayload[]): Promise<ImportResult> {
  const response = await apiClient.post<ApiResponse<ImportResult>>("/import/articles", payload);
  return response.data.data;
}
