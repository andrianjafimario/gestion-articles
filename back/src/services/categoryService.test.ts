import * as categoryService from "../services/categoryService";
import { ConflictError, NotFoundError } from "../utils/errors";
import prisma from "../utils/database";

// Mock Prisma
jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    article: {
      count: jest.fn(),
    },
  },
}));

describe("Category Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("should return all categories ordered by creation date", async () => {
      const mockCategories = [
        {
          id: "1",
          name: "Tech",
          slug: "tech",
          description: "Technology",
          color: "#FF6B6B",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.category.findMany as jest.Mock).mockResolvedValue(
        mockCategories
      );

      const result = await categoryService.getAllCategories();

      expect(result).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("createCategory", () => {
    it("should create a new category successfully", async () => {
      const newCategory = {
        name: "Business",
        slug: "business",
        description: "Business articles",
        color: "#4ECDC4",
      };

      const mockCreated = {
        id: "2",
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await categoryService.createCategory(newCategory);

      expect(result).toEqual(mockCreated);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: newCategory,
      });
    });

    it("should throw ConflictError if category slug already exists", async () => {
      const newCategory = {
        name: "Tech",
        slug: "tech",
        description: "Technology",
        color: "#FF6B6B",
      };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        ...newCategory,
      });

      await expect(categoryService.createCategory(newCategory)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe("getCategoryById", () => {
    it("should return a category by id", async () => {
      const mockCategory = {
        id: "1",
        name: "Tech",
        slug: "tech",
        description: "Technology",
        color: "#FF6B6B",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory
      );

      const result = await categoryService.getCategoryById("1");

      expect(result).toEqual(mockCategory);
    });

    it("should throw NotFoundError if category does not exist", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.getCategoryById("999")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("deleteCategory", () => {
    it("should throw ConflictError if category has articles", async () => {
      const mockCategory = {
        id: "1",
        name: "Tech",
        slug: "tech",
        description: "Technology",
        color: "#FF6B6B",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory
      );
      (prisma.article.count as jest.Mock).mockResolvedValue(5);

      await expect(categoryService.deleteCategory("1")).rejects.toThrow(
        ConflictError
      );
      expect((prisma.article.count as jest.Mock).mock.calls[0][0].where).toEqual({
        categories: { some: { id: "1" } },
      });
    });
  });
});
