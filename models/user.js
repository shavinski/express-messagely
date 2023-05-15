"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");


/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    // console.log('\n hashed password =>', hashedPassword, '\n');

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

    if (user) {
      return await bcrypt.compare(password, user.password);
    } else {
      throw NotFoundError();
    }


  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
       SET last_login_at = current_timestamp
         WHERE username = $1`,
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users`
    )

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
      // RETURNING username, first_name, last_name, phone, join_at, last_login_at`,
      [username]);

    let singleUser = result.rows[0];

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
                  m.from_username,
                  f.first_name AS from_first_name,
                  f.last_name AS from_last_name,
                  f.phone AS from_phone,
                  m.to_username,
                  t.first_name AS to_first_name,
                  t.last_name AS to_last_name,
                  t.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.from_username = $1`,
      [username])

    const msgsFrom = result.rows[0];
    console.log('\n msgsFrom =>', msgsFrom, '\n');

    return [{
      id: msgsFrom.id,
      to_user: {
        username: msgsFrom.to_username,
        first_name: msgsFrom.to_first_name,
        last_name: msgsFrom.to_last_name,
        phone: msgsFrom.to_phone
      },
      body: msgsFrom.body,
      sent_at: msgsFrom.sent_at,
      read_at: msgsFrom.read_at
    }]
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
                  m.to_username,
                  t.first_name AS to_first_name,
                  t.last_name AS to_last_name,
                  t.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.to_username = $1`,
      [username])

    const msgs = result.rows[0];
    console.log('\n msgs =>', msgs, '\n');

    return [{
      id: msgs.id,
      from_user: {
        username: msgs.from_username,
        first_name: msgs.from_first_name,
        last_name: msgs.from_last_name,
        phone: msgs.from_phone
      },
      body: msgs.body,
      sent_at: msgs.sent_at,
      read_at: msgs.read_at
    }]
  }
}


module.exports = User;
