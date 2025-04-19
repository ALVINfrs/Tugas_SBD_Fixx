const { pool } = require("../config/database");

async function createOrder(orderData, items) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      userId,
      customerName,
      email,
      phone,
      address,
      subtotal,
      shipping,
      total,
      paymentMethod,
    } = orderData;

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (user_id, customer_name, email, phone, address, subtotal, 
        shipping_fee, total, payment_method, order_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'completed')`,
      [
        userId,
        customerName,
        email,
        phone,
        address,
        subtotal,
        shipping,
        total,
        paymentMethod,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, price, quantity, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.price * item.quantity,
        ]
      );
    }

    const orderNumber = `KKS-${orderId}-${Date.now().toString().slice(-6)}`;

    await connection.query("UPDATE orders SET order_number = ? WHERE id = ?", [
      orderNumber,
      orderId,
    ]);

    await connection.commit();

    return {
      orderId,
      orderNumber,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getOrderById(orderId) {
  const [orders] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [
    orderId,
  ]);

  if (orders.length === 0) {
    return null;
  }

  // Get order items
  const [items] = await pool.query(
    `SELECT * FROM order_items WHERE order_id = ?`,
    [orderId]
  );

  return {
    order: orders[0],
    items: items,
  };
}

async function getUserOrders(userId) {
  const [orders] = await pool.query(
    `SELECT o.*, 
     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o 
     WHERE user_id = ? 
     ORDER BY order_date DESC`,
    [userId]
  );

  // Get items for each order
  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return orders;
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
};
