// backend/helpers/memberCheck.js

// imports
const { prisma } = require("../lib/prisma.js");

// check if user is in channel
const memberCheck = async (channelId, userId) => {
  const member = await prisma.channel.findFirst({
    where: { id: channelId, users: { some: { id: userId } } },
  });

  return member;
};

module.exports = { memberCheck };
