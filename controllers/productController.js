const productModel = require("../models/productModel");

async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

module.exports = {
  getAllProducts,
};
