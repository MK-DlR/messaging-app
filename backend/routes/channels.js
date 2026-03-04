// backend/routes/channels.js

const express = require("express");
const router = express.Router();
const channelsController = require("../controllers/channels.js");
const { authJWT } = require("../middleware/auth.js");

// create a channel (DM or group)
router.post("/new-channel", authJWT, channelsController.channelPost);

// fetch list of all channels user is in
router.get("/all-channels", authJWT, channelsController.channelsGet);

// fetch single channel's details (name, type, members, created date, etc)
router.get("/details/:id", authJWT, channelsController.channelDetailsGet);

// update channel name
router.put("/manage/:id/rename", authJWT, channelsController.channelPut);

// delete channel
router.delete("/delete/:id", authJWT, channelsController.channelDelete);

// leave channel
router.delete("/leave/:id", authJWT, channelsController.channelLeave);

// add/remove members from group channels if channel creator
router.put("/manage/:id/members", authJWT, channelsController.membersPut);

module.exports = router;
