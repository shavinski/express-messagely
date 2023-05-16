"use strict";

const { application } = require("express");
const { BadRequestError,
    UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser } = require("../middleware/auth")
const User = require("../models/user");



const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();

    const { username, password } = req.body;

    const user = await User.authenticate(username, password);

    if (user) {
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    }

    throw new UnauthorizedError("Invalid username or password");
})

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();

    const user = await User.register(req.body);

    if (user) {
        const token = jwt.sign({ user: user.username }, SECRET_KEY);
        return res.json({ token });
    }

})

module.exports = router;