import { PrismaClient } from "@prisma/client";
import { ConflictError } from "./errors";

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    // Check if data already exists
    const networkCount = await prisma.network.count();
    if (networkCount > 0) {
      console.log("Database already seeded, skipping initialization");
      return;
    }

    console.log("Initializing database with seed data...");

    // Create Networks
    const networks = await Promise.all([
      prisma.network.create({
        data: {
          name: "Tech Enthusiasts",
          description: "A network for technology enthusiasts and developers",
        },
      }),
      prisma.network.create({
        data: {
          name: "Business Leaders",
          description: "A network for business professionals and entrepreneurs",
        },
      }),
    ]);

    // Create Categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Technology",
          slug: "technology",
          description: "Articles about technology and innovation",
          color: "#FF6B6B",
        },
      }),
      prisma.category.create({
        data: {
          name: "Business",
          slug: "business",
          description: "Articles about business and entrepreneurship",
          color: "#4ECDC4",
        },
      }),
      prisma.category.create({
        data: {
          name: "Lifestyle",
          slug: "lifestyle",
          description: "Articles about lifestyle and wellbeing",
          color: "#95E1D3",
        },
      }),
    ]);

    // Create Demo Articles
    const demoArticles = [
      {
        title: "Getting Started with Node.js and TypeScript",
        excerpt: "Learn how to set up a Node.js project with TypeScript for better development experience.",
        content: `Node.js is a powerful runtime for building server-side applications. When combined with TypeScript, 
        you get the benefits of static typing and better IDE support. This article will guide you through the setup process.
        
        Key benefits of using TypeScript with Node.js:
        - Type safety prevents many common bugs
        - Better IDE autocomplete and refactoring support
        - Easier code documentation through types
        - Improved maintainability for large codebases`,
        author: "Jane Developer",
        networkId: networks[0].id,
        categoryIds: [categories[0].id],
        featured: true,
      },
      {
        title: "Building Scalable REST APIs",
        excerpt: "Best practices for designing REST APIs that can scale with your user base.",
        content: `Creating a REST API is one thing, but ensuring it scales effectively is another. This guide covers
        pagination, caching strategies, rate limiting, and database optimization techniques.
        
        Topics covered:
        - API versioning strategies
        - Pagination implementation
        - Caching mechanisms
        - Rate limiting best practices
        - Database indexing for performance`,
        author: "John Backend",
        networkId: networks[0].id,
        categoryIds: [categories[0].id],
        featured: true,
      },
      {
        title: "Digital Transformation in 2024",
        excerpt: "How businesses are leveraging digital technologies to stay competitive.",
        content: `Digital transformation is no longer optional for businesses. Companies that embrace digital change
        are seeing improved efficiency, better customer experiences, and increased revenue.
        
        Key areas of digital transformation:
        - Cloud migration and infrastructure
        - AI and machine learning adoption
        - Data analytics and business intelligence
        - Customer experience optimization`,
        author: "Sarah Manager",
        networkId: networks[1].id,
        categoryIds: [categories[1].id],
      },
      {
        title: "The Future of Artificial Intelligence",
        excerpt: "Exploring the emerging trends and opportunities in AI development.",
        content: `Artificial Intelligence continues to evolve at an unprecedented pace. From large language models 
        to computer vision, the applications are becoming more diverse and impactful.
        
        Emerging AI trends:
        - Generative AI and LLMs
        - AI in healthcare and diagnostics
        - Autonomous systems and robotics
        - Ethical AI and responsible development`,
        author: "Dr. Alex Lee",
        networkId: networks[0].id,
        categoryIds: [categories[0].id],
      },
      {
        title: "Startup Culture and Remote Work",
        excerpt: "Building a thriving startup culture in the age of remote work.",
        content: `Remote work has become the norm for many startups. However, maintaining company culture 
        and team cohesion requires intentional strategies and tools.
        
        Remote work best practices:
        - Asynchronous communication tools
        - Virtual team building activities
        - Clear goals and metrics
        - Work-life balance culture`,
        author: "Emma Entrepreneur",
        networkId: networks[1].id,
        categoryIds: [categories[1].id],
        featured: true,
      },
      {
        title: "Web Performance Optimization",
        excerpt: "Techniques to make your websites faster and more responsive.",
        content: `Web performance is crucial for user satisfaction and SEO rankings. Slow websites lose users 
        and revenue. This comprehensive guide covers optimization strategies across the stack.
        
        Performance optimization areas:
        - Frontend optimization (lazy loading, code splitting)
        - Image optimization and compression
        - Server-side caching
        - CDN deployment
        - Database query optimization`,
        author: "Tom Frontend",
        networkId: networks[0].id,
        categoryIds: [categories[0].id, categories[1].id],
      },
      {
        title: "Mental Health in Tech",
        excerpt: "Understanding and addressing mental health challenges in the technology industry.",
        content: `The tech industry is known for its fast pace and high expectations. Mental health is often overlooked
        but is crucial for long-term success and wellbeing.
        
        Topics covered:
        - Recognizing burnout signs
        - Work-life balance strategies
        - Mental health resources
        - Creating supportive team environments`,
        author: "Lisa Care",
        networkId: networks[0].id,
        categoryIds: [categories[2].id],
      },
      {
        title: "Cloud Architecture Patterns",
        excerpt: "Common patterns and best practices for designing cloud-native applications.",
        content: `Cloud computing has transformed how we build and deploy applications. Understanding common patterns
        helps you design systems that are scalable, resilient, and cost-effective.
        
        Key cloud patterns:
        - Microservices architecture
        - Serverless computing
        - Event-driven architecture
        - CQRS pattern
        - Saga pattern for distributed transactions`,
        author: "Mike Cloud",
        networkId: networks[0].id,
        categoryIds: [categories[0].id],
      },
      {
        title: "Market Analysis Q4 2024",
        excerpt: "Comprehensive analysis of market trends and predictions for the final quarter.",
        content: `As we approach the end of 2024, market analysts are taking stock of the year's performance
        and predicting trends for 2025. This analysis covers multiple sectors and economic indicators.
        
        Market highlights:
        - Tech sector valuations
        - Interest rate impacts
        - Cryptocurrency trends
        - Real estate market analysis
        - Consumer spending patterns`,
        author: "Robert Finance",
        networkId: networks[1].id,
        categoryIds: [categories[1].id],
      },
      {
        title: "Cybersecurity Best Practices",
        excerpt: "Essential security measures every organization should implement.",
        content: `Cybersecurity threats are increasing in sophistication and frequency. Organizations must take
        proactive measures to protect their data and systems.
        
        Security essentials:
        - Access control and authentication
        - Encryption strategies
        - Vulnerability assessment
        - Incident response planning
        - Security awareness training`,
        author: "Victoria Security",
        networkId: networks[0].id,
        categoryIds: [categories[0].id],
        featured: true,
      },
      {
        title: "Sustainable Business Practices",
        excerpt: "How businesses can balance profitability with environmental responsibility.",
        content: `Sustainability is becoming increasingly important to consumers and investors. Companies that embrace
        sustainable practices gain competitive advantages and build stronger brands.
        
        Sustainability initiatives:
        - Carbon footprint reduction
        - Green energy adoption
        - Supply chain transparency
        - Waste reduction programs
        - Community engagement`,
        author: "Green Patricia",
        networkId: networks[1].id,
        categoryIds: [categories[1].id, categories[2].id],
      },
    ];

    // Create articles with categories
    const articles = await Promise.all(
      demoArticles.map((article) =>
        prisma.article.create({
          data: {
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            author: article.author,
            networkId: article.networkId,
            featured: article.featured || false,
            status: "published",
            publishedAt: new Date(),
            categories: {
              connect: article.categoryIds.map((id) => ({ id })),
            },
          },
        })
      )
    );

    console.log("✅ Database initialized successfully!");
    console.log(`   - ${networks.length} networks created`);
    console.log(`   - ${categories.length} categories created`);
    console.log(`   - ${articles.length} articles created`);
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export default prisma;
