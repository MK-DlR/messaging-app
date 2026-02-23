// backend/routes/channels.js

const express = require("express");
const router = express.Router();
const channelsController = require("../controllers/channels.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// create a channel (DM or group)

// fetch list of channels current user is in

// fetch single channel's details (name, members, etc)

// add/remove members from group chats

module.exports = router;
