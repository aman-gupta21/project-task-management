import prisma from "./config/database.js";

async function testDatabase() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully!");
    console.log("Prisma Client is working!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();