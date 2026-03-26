// backend/scripts/backfillUsernames.js

const { prisma } = require("../lib/prisma");

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (!user.usernameNormalized) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          usernameNormalized: user.username.toLowerCase(),
        },
      });
    }
  }

  console.log("Backfill complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
