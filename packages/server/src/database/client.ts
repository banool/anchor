import { Pool } from "pg";
import { DATABASE_URL } from "../config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize the client synchronously at module load time.
// This is required because better-auth reads the prisma instance during configuration.
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export async function initializeClient() {
  // Assert we can connect to the database.
  await prisma.$connect();
  console.log("Connected to the database");
}
