import {authRoutes} from "./auth.js";
import {categoryRoutes,productRoutes} from "./products.js";
import {orderRoutes} from "./order.js";

// HELPS  TO SCALE THE APPLICATION 
const prefix = '/api';
export const registerRoutes = async(fastify, options) => {
       // Home route (health check)
       fastify.get("/", async (req, reply) => {
        return {
            status: "success",
            message: "🚀 Welcome to the Delivery API!",
            version: "1.0.0",
        };
    });
    fastify.register(authRoutes, { prefix: prefix });
    fastify.register(categoryRoutes, { prefix : prefix });
    fastify.register(productRoutes, { prefix : prefix });
    fastify.register(orderRoutes, { prefix : prefix });
}