// backend/controllers/users.js

// imports
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma.js");

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
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      // user not found
      return res.status(401).json({ error: "Invalid credentials" });
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
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    return next(err);
  }
};

// get all users
const usersGet = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany({
      select: { username: true, displayName: true, icon: true, lastSeen: true },
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
        username: username,
      },
      select: {
        username: true,
        displayName: true,
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
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    return next(err);
  }
};

// editing own profile
const profilePut = async (req, res, next) => {
  try {
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
  profileGetMe,
  usersGet,
  profileGet,
  profilePut,
  pingServer,
};
