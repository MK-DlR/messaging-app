// backend/routes/channels.js

const express = require("express");
const router = express.Router();
const channelsController = require("../controllers/channels.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// create a channel (DM or group)
// router.post("/new-channel", authJWT, lastSeen, channelsController.channelPost);

// fetch list of channels current user is in
// router.get("/all-channels", authJWT, lastSeen, channelsController.channelsGet);

// fetch single channel's details (name, type, members, created date, etc)
/*
router.get(
  "/details/:id",
  authJWT,
  lastSeen,
  channelsController.channelDetailsGet,
);
*/

// add/remove members from group chats
// router.put("/manage/:id", authJWT, lastSeen, channelsController.membersPut);

module.exports = router;
