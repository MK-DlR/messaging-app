// backend/routes/messages.js

const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messages.js");
const { authJWT } = require("../middleware/auth.js");

// create a message
router.post("/new-message", authJWT, messagesController.messagePost);

// fetch messages within channel
router.get("/all-messages/:channelId", authJWT, messagesController.messagesGet);

// editing (own) messages
router.put("/edit/:id", authJWT, messagesController.messagePut);

// deleting (own) messages
router.delete("/delete/:id", authJWT, messagesController.messageDelete);

module.exports = router;
