"use strict";

const Router = require("express").Router;
const router = new Router();
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser } = require("../middleware/auth")
const Message = require("../models/message");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const id = req.params.id;
    const message = await Message.get(id);

    return res.json({ message });
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const message = await Message.create(req.body);

    return res.json({ message });
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id', async function (req, res, next) {
    const tokenFromQueryString = req.query?.token;
    jwt.verify(tokenFromQueryString, SECRET_KEY);

    const id = req.params.id;
    const message = await Message.markRead(id);

    return res.json({ message });
})


module.exports = router;