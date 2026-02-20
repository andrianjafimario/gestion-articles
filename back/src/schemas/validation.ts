import { z } from "zod";

// Category Schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// Network Schemas
export const CreateNetworkSchema = z.object({
  name: z.string().min(1, "Network name is required"),
  description: z.string().min(1, "Description is required"),
});

export const UpdateNetworkSchema = CreateNetworkSchema.partial();

// Article Schemas
export const CreateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  author: z.string().min(1, "Author is required"),
  networkId: z.string().min(1, "Network ID is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  featured: z.boolean().optional().default(false),
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

export const ArticleStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});

export const NotifyArticleSchema = z.object({
  recipients: z.array(z.string().email("Invalid email")).min(1, "At least one recipient required"),
  subject: z.string().min(1, "Subject is required"),
});

// Query Schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const ArticleFilterSchema = PaginationSchema.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  networkId: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

// Type exports for TypeScript
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CreateNetwork = z.infer<typeof CreateNetworkSchema>;
export type UpdateNetwork = z.infer<typeof UpdateNetworkSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
export type ArticleStatus = z.infer<typeof ArticleStatusSchema>;
export type NotifyArticle = z.infer<typeof NotifyArticleSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ArticleFilter = z.infer<typeof ArticleFilterSchema>;
