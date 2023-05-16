"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser } = require("../middleware/auth")

    // FIXME: REPLACE ALL OF THE VERIFY TOKENS WITH MIDDLEWARE SUPPLIED TO USE
    // FIXME: REPLACE ALL REMEMBER JAKOB


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get('/', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const users = await User.all();

    return res.json({ users });
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async function (req, res, next) {
    //FIXME: fix security here so that only the user that is logged in 
    // can view their own detail but cant view anyone elses
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const username = req.params.username;
    const user = await User.get(username);

    return res.json({ user });
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const username = req.params.username;
    const messages = await User.messagesTo(username);

    return res.json({ messages });
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const username = req.params.username;
    const messages = await User.messagesFrom(username);

    return res.json({ messages });
})

module.exports = router;