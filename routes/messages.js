"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")


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

router.get(
    '/:id',
    ensureLoggedIn,

    async function (req, res, next) {
        //FIXME: make sure person who logged in is the person who wrote the message 
        // or the person it was sent to 
        let username = res.locals.user.username;

        console.log(username);



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
router.post(
    '/',

    ensureLoggedIn,

    async function (req, res, next) {
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
router.post(
    '/:id/read',

    ensureLoggedIn,

    async function (req, res, next) {
        //FIXME: only the person who was sent the message can mark as read
        // the to user, if not reject and sent unauth error 

        const id = req.params.id;
        const message = await Message.markRead(id);

        return res.json({ message });
    })


module.exports = router;