// backend/controllers/users.js

// imports
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma.js");
const e = require("express");

// check if user is guest
const isGuestUser = (user) => user.usernameNormalized === "guest";

// registration - inserts new user into schema
const registerPost = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      error: validationErrors.array().map((e) => e.msg),
    });
  }

  let errors = [];

  try {
    const { username, password, confirmPassword } = req.body;

    // check if username meets requirements
    function validateUsername(username) {
      const errors = [];

      // check username is between 2 and 32 characters
      if (username.length < 2) {
        errors.push("Username must be at least 2 characters.");
      }
      if (username.length > 32) {
        errors.push("Username must be 32 characters or less.");
      }

      // check valid characters
      const pattern = /^[a-zA-Z0-9._-]+$/;
      if (!pattern.test(username)) {
        errors.push(
          "Username contains invalid characters. Only letters, numbers, periods, and underscores are allowed.",
        );
      }

      return errors;
    }

    const usernameErrors = validateUsername(username);
    errors = errors.concat(usernameErrors);

    // convert username to lowercase
    const lowercaseUser = username.toLowerCase();

    // check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { usernameNormalized: lowercaseUser },
    });

    if (existingUser) {
      errors.push("Username already taken.");
    }

    // check if password meets requirements
    function validatePassword(password) {
      const errors = [];

      // check password length
      if (password.length < 6)
        errors.push("Password must be at least 6 characters.");

      // check valid characters
      if (!/[A-Z]/.test(password))
        errors.push("Password must contain at least one uppercase letter.");
      if (!/[a-z]/.test(password))
        errors.push("Password must contain at least one lowercase letter.");
      if (!/[0-9]/.test(password))
        errors.push("Password must contain at least one number.");

      return errors;
    }

    const passwordErrors = validatePassword(password);
    errors = errors.concat(passwordErrors);

    if (password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }

    // return all errors at once
    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    // hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        usernameNormalized: lowercaseUser,
        password: hashedPassword,
      },
    });

    // set lastSeen status
    await prisma.user.update({
      where: { id: newUser.id },
      data: { lastSeen: new Date() },
    });

    // find default channel
    const defaultChannel = await prisma.channel.findFirst({
      where: { isDefault: true },
    });

    // connect new user to default channel
    await prisma.channel.update({
      where: { id: defaultChannel.id },
      data: { users: { connect: { id: newUser.id } } },
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    return next(err);
  }
};

// login
const loginPost = async (req, res, next) => {
  try {
    // extract username and password
    const { username, password } = req.body;

    // convert username to lowercase
    const lowercaseUser = username.toLowerCase();

    // search for user by username
    const result = await prisma.user.findUnique({
      where: {
        usernameNormalized: lowercaseUser,
      },
    });
    if (result) {
      // compare password
      const isMatch = await bcrypt.compare(req.body.password, result.password);

      // password correct
      if (isMatch) {
        // set lastSeen status
        await prisma.user.update({
          where: { id: result.id },
          data: { lastSeen: new Date() },
        });

        const token = jwt.sign(
          { id: result.id }, // payload
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN },
        );
        res.status(200).json({ token });
      } else {
        return res.status(401).json({ error: "Invalid credentials." });
      }
    } else {
      // user not found
      return res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (err) {
    return next(err);
  }
};

// guest account login
const guestLoginPost = async (req, res, next) => {
  try {
    // search for user by username
    const result = await prisma.user.findUnique({
      where: {
        usernameNormalized: "guest",
      },
    });
    if (result) {
      // set lastSeen status
      await prisma.user.update({
        where: { id: result.id },
        data: { lastSeen: new Date() },
      });

      const token = jwt.sign(
        { id: result.id }, // payload
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );
      res.status(200).json({ token });
    } else {
      // guest user not found - indicates a setup problem
      return res.status(500).json({
        error: "Guest account not configured. Please contact support.",
      });
    }
  } catch (err) {
    return next(err);
  }
};

// fetch and return current user's data
const profileGetMe = async (req, res, next) => {
  try {
    // extract user's id
    const id = req.user.id;

    // search for user by id
    const userData = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        username: true,
        displayName: true,
        id: true,
        icon: true,
        profileInfo: true,
        lastSeen: true,
      },
    });
    if (userData) {
      // return user
      res.status(200).json({ userData });
    } else {
      // user not found
      return res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    return next(err);
  }
};

// get all users
const usersGet = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        icon: true,
        lastSeen: true,
      },
      orderBy: { username: "asc" },
    });
    res.status(200).json({ users: allUsers });
  } catch (err) {
    return next(err);
  }
};

// viewing profiles
const profileGet = async (req, res, next) => {
  try {
    // extract username
    const { username } = req.params;

    // search for user by username
    const result = await prisma.user.findUnique({
      where: {
        usernameNormalized: username.toLowerCase(),
      },
      select: {
        username: true,
        displayName: true,
        id: true,
        icon: true,
        profileInfo: true,
        lastSeen: true,
      },
    });
    if (result) {
      // return user
      res.status(200).json({ result });
    } else {
      // user not found
      return res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    return next(err);
  }
};

// editing own profile
const profilePut = async (req, res, next) => {
  try {
    // fetch user to check if guest
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { usernameNormalized: true },
    });

    // if guest, deny update
    if (isGuestUser(currentUser)) {
      return res.status(403).json({
        error: "Guest accounts cannot be edited.",
      });
    }

    // extract fields to update
    const { displayName, icon, profileInfo } = req.body;

    // update fields
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, icon, profileInfo },
      select: {
        username: true,
        displayName: true,
        icon: true,
        profileInfo: true,
        lastSeen: true,
      },
    });

    // return user
    res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// ping to update lastSeen status
const pingServer = async (req, res, next) => {
  try {
    // set lastSeen status
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastSeen: new Date() },
    });

    res.status(200).json({ message: "pong" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  registerPost,
  loginPost,
  guestLoginPost,
  profileGetMe,
  usersGet,
  profileGet,
  profilePut,
  pingServer,
};
