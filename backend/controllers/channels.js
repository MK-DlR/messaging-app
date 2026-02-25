// backend/controllers/channels.js

// imports
const { prisma } = require("../lib/prisma.js");

// create a channel (DM or group)
const channelPost = async (req, res, next) => {
  try {
    // before creating a channel:
    // check if it already exists between those users
    // isGroup = false (check if dm)
    // has the exact users as members
    // in any order
    // --
    // DMs:
    // 2 users
    // default name is derived from participants
    // can be custom renamed
    // --
    // GROUP:
    // 3 or more people
    // default name is derived from participants
    // can be custom renamed
  } catch (err) {
    return next(err);
  }
};

// fetch list of channels current user is in
const channelsGet = async (req, res, next) => {
  try {
    // users can only see channels they're in
    // plus the default main chat they're added to by default
    // when registering
  } catch (err) {
    return next(err);
  }
};

// fetch single channel's details (name, type, members, created date, etc)
const channelDetailsGet = async (req, res, next) => {
  try {
    // users can only get details of channels they're in
    // which should be the only channels they can see
    // based on channelsGet
  } catch (err) {
    return next(err);
  }
};

// add/remove members from group chats
const membersPut = async (req, res, next) => {
  try {
    // only group channel creator can add/remove members
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  /* channelPost, channelsGet, channelDetailsGet, membersPut */
};
