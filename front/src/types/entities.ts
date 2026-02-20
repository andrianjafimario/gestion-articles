export type ArticleStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Network {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  categories: Category[];
  network: Network;
  networkId: string;
  status: ArticleStatus;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotification {
  id: string;
  articleId: string;
  article?: Article;
  recipients: string[] | string;
  subject: string;
  sentAt: string;
  createdAt: string;
  status: "sent" | "failed";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}
