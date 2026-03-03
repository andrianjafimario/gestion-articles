import * as articleService from "../services/articleService";
import { NotFoundError } from "../utils/errors";
import prisma from "../utils/database";

// Mock Prisma
jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    network: {
      findUnique: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  },
}));

describe("Article Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createArticle", () => {
    it("should create a new article successfully", async () => {
       // 1) Arrange: entrée
      const newArticle = {
        title: "Test Article",
        content: "Test content",
        excerpt: "Test excerpt",
        author: "Test Author",
        networkId: "net-1",
        categoryIds: ["cat-1"],
        featured: false,
      };

        // 2) Arrange: faux retours BDD
      const mockNetwork = { id: "net-1", name: "Tech" };
      const mockCategories = [{ id: "cat-1", name: "Technology" }];
      const mockCreated = {
        id: "art-1",
        ...newArticle,
        status: "draft",
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        network: mockNetwork,
        categories: mockCategories,
      };

      // 3) Arrange: comportement des mocks Prisma
      (prisma.network.findUnique as jest.Mock).mockResolvedValue(mockNetwork);
      (prisma.category.findMany as jest.Mock).mockResolvedValue(
        mockCategories
      );
      (prisma.article.create as jest.Mock).mockResolvedValue(mockCreated);

       // 4) Act
      const result = await articleService.createArticle(newArticle);

      // 5) Assert
      expect(result).toEqual(mockCreated);
      expect(prisma.network.findUnique).toHaveBeenCalledWith({
        where: { id: "net-1" },
      });
    });

    it("should throw NotFoundError if network does not exist", async () => {
      const newArticle = {
        title: "Test Article",
        content: "Test content",
        excerpt: "Test excerpt",
        author: "Test Author",
        networkId: "invalid-net",
        categoryIds: ["cat-1"],
        featured: false,
      };

      (prisma.network.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(articleService.createArticle(newArticle)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw NotFoundError if any category does not exist", async () => {
      const newArticle = {
        title: "Test Article",
        content: "Test content",
        excerpt: "Test excerpt",
        author: "Test Author",
        networkId: "net-1",
        categoryIds: ["cat-1", "cat-999"],
        featured: false,
      };

      const mockNetwork = { id: "net-1", name: "Tech" };
      const mockCategories = [{ id: "cat-1", name: "Technology" }];

      (prisma.network.findUnique as jest.Mock).mockResolvedValue(mockNetwork);
      (prisma.category.findMany as jest.Mock).mockResolvedValue(
        mockCategories
      );

      await expect(articleService.createArticle(newArticle)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getArticles", () => {
    it("should return paginated articles with filters", async () => {
      const mockArticles = [
        {
          id: "art-1",
          title: "Article 1",
          content: "Content",
          excerpt: "Excerpt",
          author: "Author",
          networkId: "net-1",
          status: "published",
          featured: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          categories: [],
          network: { id: "net-1", name: "Tech" },
        },
      ];

      (prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles);
      (prisma.article.count as jest.Mock).mockResolvedValue(1);

      const result = await articleService.getArticles({
        page: 1,
        limit: 10,
        status: "published",
      });

      expect(result.articles).toEqual(mockArticles);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it("should apply pagination correctly", async () => {
      const mockArticles: any[] = [];
      (prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles);
      (prisma.article.count as jest.Mock).mockResolvedValue(100);

      const result = await articleService.getArticles({
        page: 2,
        limit: 10,
      });

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.pagination.pages).toBe(10);
    });
  });

  describe("updateArticleStatus", () => {
    it("should update article status to published with date", async () => {
      const mockArticle = {
        id: "art-1",
        title: "Test",
        status: "draft",
        publishedAt: null,
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prisma.article.update as jest.Mock).mockResolvedValue({
        ...mockArticle,
        status: "published",
        publishedAt: new Date(),
      });

      const result = await articleService.updateArticleStatus(
        "art-1",
        "published"
      );

      expect(result.status).toBe("published");
      expect(result.publishedAt).not.toBeNull();
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article successfully", async () => {
      const mockArticle = { id: "art-1", title: "Test Article" };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prisma.article.delete as jest.Mock).mockResolvedValue(mockArticle);

      const result = await articleService.deleteArticle("art-1");

      expect(result).toEqual(mockArticle);
      expect(prisma.article.delete).toHaveBeenCalledWith({
        where: { id: "art-1" },
        include: { categories: true, network: true },
      });
    });

    it("should throw NotFoundError when article does not exist", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(articleService.deleteArticle("invalid")).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
