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
// router.get("/:id", usersController.functionName);

// edit own profile
// router.put("/:id", authJWT, usersController.functionName);

// last seen timestamp

module.exports = router;
