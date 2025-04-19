const orderModel = require("../models/orderModel");

async function createOrder(req, res) {
  const {
    customerName,
    email,
    phone,
    address,
    items,
    subtotal,
    shipping,
    total,
    paymentMethod,
  } = req.body;

  const userId = req.session.userId || null;

  try {
    const orderData = {
      userId,
      customerName,
      email,
      phone,
      address,
      subtotal,
      shipping,
      total,
      paymentMethod,
    };

    const result = await orderModel.createOrder(orderData, items);

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Gagal membuat pesanan" });
  }
}

async function getOrderById(req, res) {
  const orderId = req.params.id;

  try {
    const orderData = await orderModel.getOrderById(orderId);

    if (!orderData) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    res.json(orderData);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Gagal mengambil data pesanan" });
  }
}

async function getUserOrders(req, res) {
  try {
    const orders = await orderModel.getUserOrders(req.session.userId);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
};
