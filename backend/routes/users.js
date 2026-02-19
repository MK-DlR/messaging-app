// backend/routes/users.js

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");

// registration
router.post("/register", usersController.registerPost);

// login
router.post("/login", usersController.loginPost);

// logout

// viewing/editing own profile

// viewing other profiles

// last seen timestamp

module.exports = router;
