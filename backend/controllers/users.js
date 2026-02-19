// backend/controllers/users.js

// imports
const validationResult = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma.js");

// registration - inserts new user into schema
export const registerPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    console.log(`${newUser.username} registered successfully`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return next(err);
  }
};

// login
export const loginPost = (req, res) => {
  // receives username and password
  // verifies credientals
  // sends back JWT token if successful
};

// logout

// viewing/editing own profile

// viewing other profiles

// last seen timestamp
