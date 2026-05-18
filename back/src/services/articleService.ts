import prisma from "../utils/database";
import {
  CreateArticle,
  UpdateArticle,
  ArticleFilter,
} from "../schemas/validation";
import { NotFoundError } from "../utils/errors";

export async function getArticles(filters: ArticleFilter) {
  const { page, limit, status, networkId, categoryId, featured } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (networkId) where.networkId = networkId;
  if (featured) where.featured = featured;
  if (categoryId) {
    where.categories = {
      some: { id: categoryId },
    };
  }
  //commentaire pour expliquer la logique de filtrage des articles en fonction des critères fournis dans les filtres.

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        categories: true,
        network: true,
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      categories: true,
      network: true,
      notifications: true,
    },
  });

  if (!article) {
    throw new NotFoundError("Article not found");
  }

  return article;
}

export async function createArticle(data: CreateArticle) {
  // Verify network exists
  const network = await prisma.network.findUnique({
    where: { id: data.networkId },
  });

  if (!network) {
    throw new NotFoundError(`Network with id "${data.networkId}" not found`);
  }

  // Verify all categories exist
  const categories = await prisma.category.findMany({
    where: { id: { in: data.categoryIds } },
  });

  if (categories.length !== data.categoryIds.length) {
    throw new NotFoundError("One or more categories not found");
  }

  return prisma.article.create({
    data: {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      featured: data.featured || false,
      networkId: data.networkId,
      categories: {
        connect: data.categoryIds.map((id) => ({ id })),
      },
    },
    include: {
      categories: true,
      network: true,
    },
  });
}

export async function updateArticle(id: string, data: UpdateArticle) {
  const article = await getArticleById(id); // Verify article exists

  // If networkId is being changed, verify it exists
  if (data.networkId) {
    const network = await prisma.network.findUnique({
      where: { id: data.networkId },
    });

    if (!network) {
      throw new NotFoundError(`Network with id "${data.networkId}" not found`);
    }
  }

  // If categories are being changed, verify they exist
  if (data.categoryIds) {
    const categories = await prisma.category.findMany({
      where: { id: { in: data.categoryIds } },
    });

    if (categories.length !== data.categoryIds.length) {
      throw new NotFoundError("One or more categories not found");
    }
  }

  return prisma.article.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.excerpt && { excerpt: data.excerpt }),
      ...(data.author && { author: data.author }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.networkId && { networkId: data.networkId }),
      ...(data.categoryIds && {
        categories: {
          set: [], // Clear existing
          connect: data.categoryIds.map((id) => ({ id })), // Add new ones
        },
      }),
    },
    include: {
      categories: true,
      network: true,
    },
  });
}

export async function updateArticleStatus(
  id: string,
  status: "draft" | "published" | "archived"
) {
  const article = await prisma.article.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
    include: { categories: true, network: true },
  });
  return article;
}

export async function deleteArticle(id: string) {
  await getArticleById(id); // Verify article exists

  return prisma.article.delete({
    where: { id },
    include: {
      categories: true,
      network: true,
    },
  });
}

export async function importArticles(articlesData: CreateArticle[]) {
  const importedArticles = await Promise.all(
    articlesData.map((data) => createArticle(data))
  );

  return {
    count: importedArticles.length,
    articles: importedArticles,
  };
}
