// backend/routes/users.js

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");
const authJWT = require("../middleware/auth.js");

// registration
router.post("/register", usersController.registerPost);

// login
router.post("/login", usersController.loginPost);

// view profiles
router.get("/:username", usersController.profileGet);

// edit own profile
router.put("/:username", authJWT, usersController.profilePut);

// last seen timestamp

module.exports = router;
