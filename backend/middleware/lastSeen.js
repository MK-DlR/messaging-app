// backend/middleware/lastSeen.js

const { prisma } = require("../lib/prisma");

// update user last seen status
const lastSeen = async (req, res, next) => {
  if (req.user) {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { lastSeen: new Date() },
      });

      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
};

module.exports = { lastSeen };
