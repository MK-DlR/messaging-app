// backend/prisma/seed.js

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { PrismaClient } = require("../generated/prisma");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// create default channel
async function main() {
  const defaultChannel = await prisma.channel.findFirst({
    where: { name: "Main Chat" },
  });

  if (!defaultChannel) {
    const createChannel = await prisma.channel.create({
      data: {
        name: "Main Chat",
        isDefault: true,
        isGroup: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
