import {
    confirmOrder,
    updateOrderStatus,
    getOrderById,
    getOrders,
    createOrder,
} from "../controllers/order/order.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { tryCatchWrapper } from "../utils/tryCatchWrapper.js";

/**
 * Order-related routes
 * @param {FastifyInstance} fastify
 * @param {*} options
 */
export const orderRoutes = tryCatchWrapper(async (fastify, options) => {
    // Global auth middleware for all order routes
    fastify.addHook("preHandler", async (req, reply) => {
        const isAuthenticated = await verifyToken(req, reply);
        if (!isAuthenticated) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });

    // Create a new order (Customer)
    fastify.route({
        method: "POST",
        url: "/order",
        handler: createOrder,
    });

    // Confirm an order (Delivery Partner)
    fastify.route({
        method: "POST",
        url: "/order/:orderId/confirm",
        handler: confirmOrder,
    });

    // Update order status (Delivery Partner)
    fastify.route({
        method: "PATCH",
        url: "/order/:orderId/status",
        handler: updateOrderStatus,
    });

    // Get order by ID
    fastify.route({
        method: "GET",
        url: "/order/:orderId",
        handler: getOrderById,
    });

    // Get multiple orders (filtered)
    fastify.route({
        method: "GET",
        url: "/orders",
        handler: getOrders,
    });
});
