import prisma from "../utils/database";
import {
  CreateCategory,
  UpdateCategory,
} from "../schemas/validation";
import { ConflictError, NotFoundError } from "../utils/errors";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
}

export async function createCategory(data: CreateCategory) {
  const existingCategory = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existingCategory) {
    throw new ConflictError(`Category with slug "${data.slug}" already exists`);
  }

  return prisma.category.create({
    data,
  });
}

export async function updateCategory(id: string, data: UpdateCategory) {
  await getCategoryById(id); // Verify category exists

  // Check if slug is being changed and if new slug already exists
  if (data.slug) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictError(`Category with slug "${data.slug}" already exists`);
    }
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id); // Verify category exists

  // Check if category is used by articles
  const articleCount = await prisma.article.count({
    where: {
      categories: {
        some: { id },
      },
    },
  });

  if (articleCount > 0) {
    throw new ConflictError(
      `Cannot delete category with ${articleCount} article(s)`
    );
  }

  return prisma.category.delete({
    where: { id },
  });
}
