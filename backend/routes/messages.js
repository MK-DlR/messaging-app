// backend/routes/messages.js

const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messages.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// send messages

// fetch messages within channel

// editing (own) messages

// deleting (own) messages

module.exports = router;
