const { pool } = require("../config/database");

async function getAllProducts() {
  const [rows] = await pool.query("SELECT * FROM products");
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  getAllProducts,
  getProductById,
};
