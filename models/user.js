"use strict";

const { NotFoundError,
  UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config")


/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone,
                             join_at,
                             last_login_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    const user = result.rows[0]

    return user;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]);

    const user = result.rows[0];

    return user && await bcrypt.compare(password, user.password) === true ;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
       SET last_login_at = current_timestamp
         WHERE username = $1`,
      [username]);

    if (!result) {
      throw new NotFoundError();
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY last_name`)

    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, 
                  first_name, 
                  last_name, 
                  phone, 
                  join_at,
                  last_login_at
        FROM users 
        WHERE username = $1`,
      [username]);

    let singleUser = result.rows[0];

    // if no user is found with this username throw not found error
    if (!singleUser) throw new NotFoundError();

    return singleUser;
  }

  /** Return messages from this user.
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
                  m.to_username,
                  t.first_name AS to_first_name,
                  t.last_name AS to_last_name,
                  t.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.from_username = $1`,
      [username])

    const allMessagesFromUser = result.rows.map(msg => (
      {
        id: msg.id,
        to_user: {
          username: msg.to_username,
          first_name: msg.to_first_name,
          last_name: msg.to_last_name,
          phone: msg.to_phone
        },
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at
      }));

    return allMessagesFromUser;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
                  m.from_username,
                  f.first_name AS from_first_name,
                  f.last_name AS from_last_name,
                  f.phone AS from_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
             WHERE m.to_username = $1`,
      [username])

    const allMessagesToUser = result.rows.map(msg => (
      {
        id: msg.id,
        from_user: {
          username: msg.from_username,
          first_name: msg.from_first_name,
          last_name: msg.from_last_name,
          phone: msg.from_phone
        },
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at
      }
    ));

    return allMessagesToUser;
  }
}


module.exports = User;
