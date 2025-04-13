import Branch from "../../models/branch.js";
import Order from "../../models/order.js";
import { Customer, DeliveryPartner, Admin } from "../../models/user.js";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper.js";
import Messages from "../../constants/messages.js";

/**
 * @route   POST /orders
 * @desc    Creates a new order for a customer by associating it with a branch
 * @access  Private (Customer only)
 *
 * Validates the customer's identity, the branch's existence, and required fields
 * like items and total price before creating the order. Sets pickup and delivery
 * locations based on branch and customer address.
 *
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - JSON response with order details or error message
 */
export const createOrder = tryCatchWrapper(async (req, res) => {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
    }

    if (!branch || !totalPrice) {
        return res.status(400).json({ message: "Branch and total price are required" });
    }

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (!customerData) {
        return res.status(404).json({ message: Messages.USER_NOT_FOUND });
    }

    if (!branchData) {
        return res.status(404).json({ message: Messages.BRANCH_NOT_FOUND });
    }

    const newOrder = new Order({
        customer: userId,
        items: items.map((item) => ({
            id: item.id,
            item: item.item,
            count: item.count,
        })),
        branch: branch,
        totalPrice,
        pickupLocation: {
            latitude: branchData.latitude,
            longitude: branchData.longitude,
            address: branchData.address || "No address provided",
        },
        deliveryLocation: {
            latitude: customerData.latitude,
            longitude: customerData.longitude,
            address: customerData.address || "No address provided",
        },
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
        message: "Order created successfully",
        order: savedOrder,
    });
});



/**
 * @route   PATCH /orders/:orderId/confirm
 * @desc    Confirms an available order by a delivery partner
 * @access  Private (DeliveryPartner only)
 *
 * Checks if the delivery partner is valid and the order is available,
 * then assigns the partner and updates delivery location and status.
 * Emits a socket event to notify clients.
 *
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - JSON response with updated order or error message
 */

//1h:12 for vide ref
export const confirmOrder = tryCatchWrapper(async (req, res) => {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

    const deliveryPartner = await DeliveryPartner.findById(userId);

    if (!deliveryPartner) {
        return res.status(404).json({ message: Messages.DELIVERY_PARTNER_NOT_FOUND });
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ message: Messages.ORDER_NOT_FOUND });
    }

    if (order.status !== "available") {
        return res.status(400).json({ message: Messages.ORDER_NOT_AVAILABLE });
    }

    if (!deliveryPersonLocation || !deliveryPersonLocation.latitude || !deliveryPersonLocation.longitude) {
        return res.status(400).json({ message: Messages.LOCATION_REQUIRED });
    }

    if (order.deliveryPartner) {
        return res.status(400).json({ message: "Order already has a delivery partner" });
    }

    order.status = "confirmed";
    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
        latitude: deliveryPersonLocation.latitude,
        longitude: deliveryPersonLocation.longitude,
        address: deliveryPersonLocation.address || "",
    };

    await order.save();

    req.server.io.to(orderId).emit("orderConfirmed", order);

    return res.status(200).json({
        message: Messages.ORDER_CONFIRMED,
        order,
    });
});

// 1h :15
/**
 * @route   PATCH /orders/:orderId/status
 * @desc    Updates the status of an order by the assigned delivery partner
 * @access  Private (DeliveryPartner only)
 * 
 * Validates delivery partner and ensures only allowed transitions.
 * Broadcasts updates via socket for live tracking and status.
 */
export const updateOrderStatus = tryCatchWrapper(async (req, res) => {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;

    if (!status || !["confirmed", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: Messages.INVALID_STATUS });
    }

    const deliveryPartner = await DeliveryPartner.findById(userId);
    if (!deliveryPartner) {
        return res.status(404).json({ message: Messages.DELIVERY_PARTNER_NOT_FOUND });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: Messages.ORDER_NOT_FOUND });
    }

    if (order.deliveryPartner.toString() !== userId.toString()) {
        return res.status(403).json({ message: Messages.NOT_AUTHORIZED });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
        return res.status(400).json({ message: Messages.ORDER_ALREADY_FINALIZED });
    }

    if (!deliveryPersonLocation || !deliveryPersonLocation.latitude || !deliveryPersonLocation.longitude) {
        return res.status(400).json({ message: Messages.LOCATION_REQUIRED });
    }

    order.status = status;
    order.deliveryPersonLocation = {
        latitude: deliveryPersonLocation.latitude,
        longitude: deliveryPersonLocation.longitude,
        address: deliveryPersonLocation.address || "",
    };

    await order.save();

    req.server.io.to(orderId).emit("liveTrackingUpdate", order);
    req.server.io.to(orderId).emit("orderStatusUpdated", order);

    return res.status(200).json({
        message: Messages.ORDER_STATUS_UPDATED,
        order,
    });
});



export const getOrders = tryCatchWrapper(async (req, res) => {
    const { status, customerId, deliveryPartnerId, branchId } = usr.query;
    let query = {};

    if (!status) {
        query.status = status;
    }
    if (customerId) {
        query.customer = customerId;
    }
    if (deliveryPartnerId) {
        query.deliveryPartner = deliveryPartnerId;
        query.branch = branchId;
    }
    // forunky code
    const orders = await Order.find(query).populate("customer branch items.item deliveryPartner");
    return res.status(200).json({
        message: "Orders fetched successfully",
        orders,
    });

});

export const getOrderById = tryCatchWrapper(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("customer branch items.item deliveryPartner");
    if (!order) {
        return res.status(404).json({ message: Messages.ORDER_NOT_FOUND });
    }
    return res.status(200).json({
        message: "Order fetched successfully",
        order,
    });
});