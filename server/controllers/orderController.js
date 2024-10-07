import Order from "../models/Order.js";
import webpush from "web-push";
import AdminSubscription from "../models/AdminSubscription.js";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ user: userId })
      .populate("items.menuItem")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching user orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItem"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
      { new: true }
    )
      .populate("user", "name email")
      .populate("items.menuItem");
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order" });
  }
};

export const deleteOrderBySessionId = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Stripe session ID is required" });
    }

    const deletedOrder = await Order.findOneAndDelete({
      stripeSessionId: session_id,
    });

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Error fetching all orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    const payload = JSON.stringify({
      title: "Order Cancelled",
      body: `Order ${updatedOrder._id} has been cancelled`,
    });
    const adminSubscriptions = await AdminSubscription.find();
    adminSubscriptions.forEach((subscription) => {
      webpush
        .sendNotification(subscription.subscription, payload)
        .catch((error) => {
          console.error(
            "Error sending notification, we will delete subscription:",
            error
          );
          AdminSubscription.findByIdAndDelete(subscription._id).catch(
            console.error
          );
        });
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};
