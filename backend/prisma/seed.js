// backend/prisma/seed.js

// imports
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { PrismaClient } = require("../generated/prisma");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  // create default channel first
  let defaultChannel = await prisma.channel.findFirst({
    where: { name: "Main Chat" },
  });

  if (!defaultChannel) {
    defaultChannel = await prisma.channel.create({
      data: {
        name: "Main Chat",
        isDefault: true,
        isGroup: true,
      },
    });
  }

  // generate and hash random password
  const randomPassword = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // then create guest user and add to Main Chat
  const guestUser = await prisma.user.findFirst({
    where: { usernameNormalized: "guest" },
  });

  if (!guestUser) {
    await prisma.user.create({
      data: {
        username: "Guest",
        usernameNormalized: "guest",
        password: hashedPassword,
        displayName: "Guest Account",
        profileInfo:
          "This is a demo account for guest use, which cannot be edited. Please note that anyone is able to access this demo account.",
        channels: {
          connect: { id: defaultChannel.id },
        },
      },
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
