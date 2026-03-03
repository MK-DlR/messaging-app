// backend/routes/users.js

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");
const { authJWT } = require("../middleware/auth.js");
const { lastSeen } = require("../middleware/lastSeen.js");

// registration
router.post("/register", usersController.registerPost);

// login
router.post("/login", usersController.loginPost);

// fetch and return current user's data
router.get("/me", authJWT, lastSeen, usersController.profileGetMe);

// get all users
router.get("/all-users", usersController.usersGet);

// view profiles
router.get("/:username", usersController.profileGet);

// edit own profile
router.put("/:username", authJWT, lastSeen, usersController.profilePut);

module.exports = router;
