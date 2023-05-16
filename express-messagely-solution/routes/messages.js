"use strict";

const { Router } = require("express");
const router = new Router();

const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
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

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  let username = res.locals.user.username;
  let msg = await Message.get(req.params.id);

  if (msg.to_user.username !== username
    && msg.from_user.username !== username) {
    throw new UnauthorizedError("Cannot read this message");
  }

  return res.json({ message: msg });
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  let msg = await Message.create({
    from_username: res.locals.user.username,
    to_username: req.body.to_username,
    body: req.body.body,
  });

  return res.json({ message: msg });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  let username = res.locals.user.username;
  let msg = await Message.get(req.params.id);

  if (msg.to_user.username !== username) {
    throw new UnauthorizedError("Cannot set message to read");
  }
  let message = await Message.markRead(req.params.id);

  return res.json({ message });
});


module.exports = router;