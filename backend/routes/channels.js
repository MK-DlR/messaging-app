// backend/routes/channels.js

const express = require("express");
const router = express.Router();
const channelsController = require("../controllers/channels.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// create a channel (DM or group)
router.post("/new-channel", authJWT, lastSeen, channelsController.channelPost);

// fetch list of all channels user is in
router.get("/all-channels", authJWT, lastSeen, channelsController.channelsGet);

// fetch single channel's details (name, type, members, created date, etc)
router.get(
  "/details/:id",
  authJWT,
  lastSeen,
  channelsController.channelDetailsGet,
);

// update channel name
router.put(
  "/manage/:id/rename",
  authJWT,
  lastSeen,
  channelsController.channelPut,
);

// delete channel
// router.delete("/delete/:id", authJWT, lastSeen, channelsController.channelDelete);

// add/remove members from group channels if channel creator
router.put(
  "/manage/:id/members",
  authJWT,
  lastSeen,
  channelsController.membersPut,
);

module.exports = router;
