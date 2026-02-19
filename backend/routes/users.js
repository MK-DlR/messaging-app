// backend/routes/users.js

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.js");

// registration
router.post("/register", usersController.registerPost);

// login

// logout

// viewing/editing own profile

// viewing other profiles

// last seen timestamp

export default router;
