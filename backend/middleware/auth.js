// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

const authJWT = (req, res, next) => {
  // get auth header value
  const bearerHeader = req.headers["authorization"];

  // check if bearer is not undefined
  if (typeof bearerHeader !== "undefined") {
    // split at space
    const bearer = bearerHeader.split(" ");
    // get token from array
    const bearerToken = bearer[1];

    // verify token
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.status(401).json({ error: "Invalid or expired token." });
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

module.exports = { authJWT };
