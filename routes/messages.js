"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");


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

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
    const username = res.locals.user.username;
    const id = req.params.id;
    const message = await Message.get(id);

    if (username !== message.to_username
        && message.from_user.username !== username) {
        throw new UnauthorizedError()
    }

    return res.json({ message });
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function (req, res, next) {
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
router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
    const username = res.locals.user.username;
    const id = req.params.id;
    const msg = await Message.get(id);

    if (username !== msg.to_user.username) {
        throw new UnauthorizedError("You are not allowed to view this message")
    }

    const message = await Message.markRead(id);

    return res.json({ message });
})


module.exports = router;