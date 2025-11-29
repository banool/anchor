import { DATABASE_URL } from "../config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export let prisma: PrismaClient;

export async function initializeClient() {
  if (!prisma) {
    // Create the client.
    const adapter = new PrismaPg({ connectionString: DATABASE_URL });
    prisma = new PrismaClient({
      adapter,
    });

    // Assert we can connect to the database.
    await prisma.$connect();

    console.log("Connected to the database");

    // Uncomment this to see a demonstration of a better error.
    // console.log("Users", await prisma.user.findMany());
  }
}
