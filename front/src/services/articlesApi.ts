import { apiClient } from "./apiClient";
import type { ApiResponse, Article, ArticleStatus, Pagination } from "../types/entities";

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  networkId?: string;
  categoryId?: string;
  featured?: boolean;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  networkId: string;
  categoryIds: string[];
  featured?: boolean;
}

export interface NotifyArticlePayload {
  recipients: string[];
  subject: string;
}

export async function listArticles(filters: ArticleFilters = {}): Promise<{
  articles: Article[];
  pagination: Pagination;
}> {
  const response = await apiClient.get<ApiResponse<Article[]>>("/articles", { params: filters });
  return {
    articles: response.data.data,
    pagination: response.data.pagination as Pagination,
  };
}

export async function getArticle(id: string): Promise<Article> {
  const response = await apiClient.get<ApiResponse<Article>>(`/articles/${id}`);
  return response.data.data;
}

export async function createArticle(payload: CreateArticlePayload): Promise<Article> {
  const response = await apiClient.post<ApiResponse<Article>>("/articles", payload);
  return response.data.data;
}

export async function updateArticle(id: string, payload: Partial<CreateArticlePayload>): Promise<Article> {
  const response = await apiClient.put<ApiResponse<Article>>(`/articles/${id}`, payload);
  return response.data.data;
}

export async function updateArticleStatus(id: string, status: ArticleStatus): Promise<Article> {
  const response = await apiClient.patch<ApiResponse<Article>>(`/articles/${id}/status`, { status });
  return response.data.data;
}

export async function deleteArticle(id: string): Promise<Article> {
  const response = await apiClient.delete<ApiResponse<Article>>(`/articles/${id}`);
  return response.data.data;
}

export async function notifyArticle(
  id: string,
  payload: NotifyArticlePayload,
): Promise<{ notification: unknown; recipients: string[] }> {
  const response = await apiClient.post<ApiResponse<{ notification: unknown; recipients: string[] }>>(
    `/articles/${id}/notify`,
    payload,
  );
  return response.data.data;
}
