const express = require("express");
const orderController = require("../controllers/orderController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/", orderController.createOrder);
router.get("/:id", orderController.getOrderById);
router.get("/user/orders", isAuthenticated, orderController.getUserOrders);

module.exports = router;
