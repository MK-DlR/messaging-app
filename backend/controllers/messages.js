// backend/controllers/messages.js

// imports
const { prisma } = require("../lib/prisma.js");
const { memberCheck } = require("../helpers/memberCheck.js");

// create a message
const messagePost = async (req, res, next) => {
  try {
    const { body } = req.body;
    const channelId = parseInt(req.body.channelId);
    const user = req.user.id;

    // check if user is in channel
    const member = await memberCheck(channelId, user);

    if (!member) {
      // if not in channel, return 403
      return res.status(403).json({ message: "Channel not found" });
    } else {
      // if in channel, send message
      const message = await prisma.message.create({
        data: { channelId: channelId, userId: user, body: body },
      });
      res.status(200).json({ message: "Message created successfully" });
    }
  } catch (err) {
    return next(err);
  }
};

// fetch messages within channel
const messagesGet = async (req, res, next) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const user = req.user.id;

    // check if user is in channel
    const member = await memberCheck(channelId, user);

    if (!member) {
      // if not in channel, return 403
      return res.status(403).json({ message: "Channel not found" });
    } else {
      // if in channel, fetch messages
      const allMessages = await prisma.message.findMany({
        where: { channelId: channelId },
        include: {
          users: {
            select: { username: true, displayName: true, icon: true },
          },
        },
      });
      res.status(200).json({ messages: allMessages });
    }
  } catch (err) {
    return next(err);
  }
};

// editing (own) messages
const messagePut = async (req, res, next) => {
  try {
    const { body } = req.body;
    const messageId = parseInt(req.params.id);
    const user = req.user.id;

    // fetch message to get channelId
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // check if user is in channel
    const member = await memberCheck(message.channelId, user);

    if (!member) {
      // if not in channel, return 403
      return res.status(403).json({ message: "Channel not found" });
    } else {
      // if in channel, check if author of message
      if (message.userId === user) {
        // edit message
        const editedMessage = await prisma.message.update({
          where: { id: messageId },
          data: { body },
        });
        res.status(200).json({ message: "Message successfully edited" });
      } else {
        // if not message author, return 403
        return res.status(403).json({ message: "Invalid credentials" });
      }
    }
  } catch (err) {
    return next(err);
  }
};

// deleting (own) messages
const messageDelete = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id);
    const user = req.user.id;

    // fetch message to get channelId
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // check if user is in channel
    const member = await memberCheck(message.channelId, user);

    if (!member) {
      // if not in channel, return 403
      return res.status(403).json({ message: "Channel not found" });
    } else {
      // if in channel, check if author of message
      if (message.userId === user) {
        // delete message
        await prisma.message.delete({
          where: { id: messageId },
        });
        res.status(200).json({ message: "Message successfully deleted" });
      } else {
        // if not message author, return 403
        return res.status(403).json({ message: "Invalid credentials" });
      }
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  messagePost,
  messagesGet,
  messagePut,
  messageDelete,
};
