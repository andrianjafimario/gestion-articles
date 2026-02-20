import prisma from "../utils/database";
import { CreateNetwork, UpdateNetwork } from "../schemas/validation";
import { ConflictError, NotFoundError } from "../utils/errors";

export async function getAllNetworks() {
  return prisma.network.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function getNetworkById(id: string) {
  const network = await prisma.network.findUnique({
    where: { id },
    include: {
      articles: true,
    },
  });

  if (!network) {
    throw new NotFoundError("Network not found");
  }

  return network;
}

export async function createNetwork(data: CreateNetwork) {
  const existingNetwork = await prisma.network.findUnique({
    where: { name: data.name },
  });

  if (existingNetwork) {
    throw new ConflictError(`Network with name "${data.name}" already exists`);
  }

  return prisma.network.create({
    data,
  });
}

export async function updateNetwork(id: string, data: UpdateNetwork) {
  await getNetworkById(id); // Verify network exists

  // Check if name is being changed and if new name already exists
  if (data.name) {
    const existingNetwork = await prisma.network.findUnique({
      where: { name: data.name },
    });

    if (existingNetwork && existingNetwork.id !== id) {
      throw new ConflictError(`Network with name "${data.name}" already exists`);
    }
  }

  return prisma.network.update({
    where: { id },
    data,
  });
}

export async function deleteNetwork(id: string) {
  await getNetworkById(id); // Verify network exists

  // Check if network has articles
  const articleCount = await prisma.article.count({
    where: { networkId: id },
  });

  if (articleCount > 0) {
    throw new ConflictError(
      `Cannot delete network with ${articleCount} article(s)`
    );
  }

  return prisma.network.delete({
    where: { id },
  });
}
