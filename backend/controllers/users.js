// backend/controllers/users.js

// imports
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma.js");

// registration - inserts new user into schema
const registerPost = async (req, res, next) => {
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
      return res.status(400).json({ error: "Username already taken" });
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
const loginPost = async (req, res, next) => {
  try {
    // extract username and password
    const { username, password } = req.body;

    // search for user by username
    const result = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (result) {
      // compare password
      bcrypt.compare(
        req.body.password,
        result.password,
        function (compareErr, isMatch) {
          if (compareErr) {
            next(compareErr);
          }
          if (isMatch) {
            // password correct
            const token = jwt.sign(
              { id: result.id }, // payload
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN },
            );
            res.status(200).json({ token });
          } else {
            // password incorrect
            return res.status(401).json({ error: "Invalid credentials" });
          }
        },
      );
    } else {
      // user not found
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    return next(err);
  }
};

// viewing profiles

// editing own profile

// last seen timestamp

module.exports = { registerPost, loginPost };
