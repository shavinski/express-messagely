"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, BadRequestError } = require("../expressError");

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  let { username, password } = req.body;
  if (await User.authenticate(username, password)) {
    let token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ token });
  } else {
    throw new UnauthorizedError("Invalid username/password");
  }
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  let { username } = await User.register(req.body);
  let token = jwt.sign({ username }, SECRET_KEY);
  User.updateLoginTimestamp(username);
  return res.json({ token });
});

module.exports = router;
