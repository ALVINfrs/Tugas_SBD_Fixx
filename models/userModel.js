const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

async function findByEmail(email) {
  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return users.length > 0 ? users[0] : null;
}

async function createUser(name, email, password, phone) {
  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, phone]
  );

  return result.insertId;
}

async function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

module.exports = {
  findByEmail,
  createUser,
  validatePassword,
};
