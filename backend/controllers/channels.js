// backend/controllers/channels.js

// imports
const { prisma } = require("../lib/prisma.js");
const { memberCheck } = require("../helpers/memberCheck.js");

// find specific group channel and check permissions
const findChannelAsCreator = async (channelId, creatorId) => {
  // check channel and permissions
  const selectedChannel = await prisma.channel.findFirst({
    where: {
      id: channelId,
      isGroup: true,
      creatorId: creatorId,
    },
  });

  return selectedChannel;
};

// find specific dm channel and check permissions
const findChannelAsCreatorAny = async (channelId, creatorId) => {
  // check channel and permissions
  const selectedChannel = await prisma.channel.findFirst({
    where: {
      id: channelId,
      creatorId: creatorId,
    },
  });

  return selectedChannel;
};

// create a channel (DM or group)
const channelPost = async (req, res, next) => {
  try {
    const { userIds, icon, name, channelInfo } = req.body;
    const creatorId = req.user.id;

    let channelName;
    let channelData;

    // determine if DM or group channel
    if (userIds.length === 1) {
      // DM channel
      // check for channels including selected users
      const channels = await prisma.channel.findMany({
        where: {
          AND: [
            { users: { some: { id: creatorId } } },
            { users: { some: { id: userIds[0] } } },
          ],
        },
        include: {
          users: { select: { id: true } },
        },
      });
      // filter results to channels where selected users are the only 2 members
      const existingChannel = channels.find((ch) => ch.users.length === 2);

      // if channel exists, return to it
      if (existingChannel) {
        return res.status(200).json({ existingChannel });
      } else {
        // if channel doesn't exist, create new DM channel
        if (!name) {
          // generate name from participant users
          const users = await prisma.user.findMany({
            where: {
              id: {
                in: [creatorId, userIds[0]],
              },
            },
            select: { username: true },
            orderBy: { username: "asc" },
          });
          channelName = users.map((user) => user.username).join(", ");
        }
      }
      // create channelData
      channelData = {
        isGroup: false,
        isCustomName: !!name,
        ...(icon && { icon: icon }), // only add if icon has a value
        name: name || channelName,
        ...(channelInfo && { channelInfo: channelInfo }), // only add if channelInfo has a value
        creatorId,
        users: { connect: [{ id: creatorId }, { id: userIds[0] }] },
      };
    } else if (userIds.length >= 2) {
      // group channel
      if (!name) {
        // generate name from number of participant users
        channelName = `Group Chat (${userIds.length + 1})`;
      }
      // create channelData
      channelData = {
        isGroup: true,
        isCustomName: !!name,
        ...(icon && { icon: icon }), // only add if icon has a value
        name: name || channelName,
        ...(channelInfo && { channelInfo: channelInfo }), // only add if channelInfo has a value
        creatorId,
        users: {
          connect: [{ id: creatorId }, ...userIds.map((id) => ({ id }))],
        },
      };
    }

    // create channel using channelData
    const channel = await prisma.channel.create({
      data: channelData,
    });
    res.status(201).json({ channel });
  } catch (err) {
    return next(err);
  }
};

// fetch list of all channels user is in
const channelsGet = async (req, res, next) => {
  try {
    const user = req.user.id;

    const channels = await prisma.channel.findMany({
      where: {
        users: { some: { id: user } },
      },
    });

    if (channels.length === 0) {
      // if no channels found
      return res.status(400).json({ error: "No channels found" });
    } else {
      // display channels
      res.status(200).json({ channels });
    }
  } catch (err) {
    return next(err);
  }
};

// fetch single channel's details (name, type, members, created date, etc)
const channelDetailsGet = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // find channel details
    const channelDetails = await prisma.channel.findFirst({
      where: {
        id: id,
        users: { some: { id: req.user.id } },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            displayName: true,
            icon: true,
            lastSeen: true,
          },
          orderBy: { username: "asc" },
        },
      },
    });

    if (!channelDetails) {
      return res.status(404).json({ error: "Channel not found" });
    } else {
      // display channel details
      res.status(200).json({ channelDetails });
    }
  } catch (err) {
    return next(err);
  }
};

// update channel details
const channelPut = async (req, res, next) => {
  try {
    const { icon, name, channelInfo } = req.body;
    const creator = req.user.id;
    const channel = parseInt(req.params.id);

    // check channel and permissions
    const selectedChannel = await findChannelAsCreatorAny(channel, creator);

    if (!selectedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    } else {
      // action logic for editing channel name
      await prisma.channel.update({
        where: { id: channel },
        data: {
          icon: icon,
          name: name,
          channelInfo: channelInfo,
          isCustomName: true,
        },
      });
      res.status(200).json({ message: "Channel name updated successfully" });
    }
  } catch (err) {
    return next(err);
  }
};

// delete channel
const channelDelete = async (req, res, next) => {
  try {
    const creator = req.user.id;
    const channel = parseInt(req.params.id);

    // check channel and permissions
    const selectedChannel = await findChannelAsCreatorAny(channel, creator);

    if (!selectedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    } else {
      // delete messages before deleting channel
      await prisma.message.deleteMany({
        where: { channelId: channel },
      });
      // delete channel
      await prisma.channel.delete({
        where: { id: channel },
      });
    }
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    return next(err);
  }
};

// leave channel
const channelLeave = async (req, res, next) => {
  try {
    const channel = parseInt(req.params.id);

    const channelData = await prisma.channel.findUnique({
      where: { id: channel },
    });

    if (channelData.isDefault === true) {
      // if trying to leave main channel, return 403
      return res.status(403).json({ message: "Channel cannot be left" });
    }

    // check if user is in channel
    const member = await memberCheck(channel, req.user.id);

    // if in channel, leave channel
    if (member) {
      await prisma.channel.update({
        where: { id: channel },
        data: { users: { disconnect: { id: req.user.id } } },
      });
      res.status(200).json({ message: "Channel left successfully" });
    } else {
      // if not in channel, return 404
      res.status(404).json({ message: "Channel not found" });
    }
  } catch (err) {
    return next(err);
  }
};

// add/remove members from group channels if channel creator
const membersPut = async (req, res, next) => {
  try {
    const { userId, action } = req.body;
    const creator = req.user.id;
    const channel = parseInt(req.params.id);

    // check channel and permissions
    const selectedChannel = await findChannelAsCreatorAny(channel, creator);

    if (!selectedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    } else {
      // action logic for adding or removing member
      if (action === "add") {
        // if channel is dm
        if (selectedChannel.isGroup === false) {
          await prisma.channel.update({
            where: { id: channel },
            data: { isGroup: true, users: { connect: { id: userId } } },
          });
        } else {
          // if channel is already a group
          await prisma.channel.update({
            where: { id: channel },
            data: { users: { connect: { id: userId } } },
          });
        }
      } else if (action === "remove") {
        await prisma.channel.update({
          where: { id: channel },
          data: { users: { disconnect: { id: userId } } },
        });
      }
      if (selectedChannel.isCustomName === false) {
        // fetch channel with users after add/remove action
        const updatedChannel = await prisma.channel.findUnique({
          where: { id: channel },
          include: { users: true },
        });

        // recalculate name from number of participant users
        let newName = `Group Chat (${updatedChannel.users.length})`;

        // set new channel name
        await prisma.channel.update({
          where: { id: channel },
          data: { name: newName },
        });
      }
      res.status(200).json({ message: "Member updated successfully" });
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  channelPost,
  channelsGet,
  channelDetailsGet,
  channelPut,
  channelDelete,
  channelLeave,
  membersPut,
};
