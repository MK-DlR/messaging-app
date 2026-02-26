// backend/routes/messages.js

const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messages.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// create a message
router.post("/new-message", authJWT, lastSeen, messagesController.messagePost);

// fetch messages within channel
router.get(
  "/all-messages/:channelId",
  authJWT,
  lastSeen,
  messagesController.messagesGet,
);

// editing (own) messages
// router.put("/edit/:id", authJWT, lastSeen, messagesController.messagePut);

// deleting (own) messages
// router.delete("/delete/:id", authJWT, lastSeen, messagesController.messageDelete);

module.exports = router;
