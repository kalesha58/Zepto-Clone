import { loginCustomer, loginDeliveryPartner, refreshToken , fetchUser} from "../controllers/auth/auth.js"
import { verifyToken } from "../middleware/verifyToken.js"
import {updateUser} from "../controllers/tracking/user.js"




export const authRoutes = async (fastify, options) => {
    fastify.route({
        method: 'POST',
        url: '/customer/login',
        handler: loginCustomer,
    });

    fastify.route({
        method: 'POST',
        url: '/delivery/login',
        handler: loginDeliveryPartner,
    });

    fastify.route({
        method: 'POST',
        url: '/refresh-token',
        handler: refreshToken,
    });
    fastify.route({
        method: 'GET',
        url: '/user',
        preHandler: verifyToken,
        handler: fetchUser,
    });
    fastify.route({
        method: 'PATCH',
        url: '/user',
        preHandler: verifyToken,
        handler: updateUser,
    });
};