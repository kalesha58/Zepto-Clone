import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper.js";
import Messages from "../../constants/messages.js";

/**
 * Generate access and refresh tokens
 */
const generateTokens = (user) => {
    const payload = { userId: user._id, role: user.role };

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFE }
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_LIFE || process.env.ACCESS_TOKEN_LIFE }
    );

    return { accessToken, refreshToken };
};

/**
 * Login or auto-register a customer by phone number
 */
export const loginCustomer = tryCatchWrapper(async (req, reply) => {
    const { phone } = req.body;

    if (!phone) {
        return reply.status(400).send({
            message: Messages.PHONE_REQUIRED,
        });
    }

    let customer = await Customer.findOne({ phone });

    if (!customer) {
        customer = new Customer({
            phone,
            role: "Customer",
            isActivated: true,
        });
        await customer.save();
    }

    const tokens = generateTokens(customer);

    return reply.status(200).send({
        message: Messages.LOGIN_SUCCESS,
        ...tokens,
        user: {
            id: customer._id,
            phone: customer.phone,
            role: customer.role,
        },
    });
});

/**
 * Login Delivery Partner
 */
export const loginDeliveryPartner = tryCatchWrapper(async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return reply.status(400).send({
            message: Messages.EMAIL_PASSWORD_REQUIRED,
        });
    }

    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
        return reply.status(404).send({
            message: Messages.DELIVERY_PARTNER_NOT_FOUND,
        });
    }

    if (!deliveryPartner.isActivated) {
        return reply.status(403).send({
            message: Messages.ACCOUNT_NOT_ACTIVATED,
        });
    }

    const isMatch = await bcrypt.compare(password, deliveryPartner.password);
    if (!isMatch) {
        return reply.status(401).send({
            message: Messages.INVALID_CREDENTIALS,
        });
    }

    const tokens = generateTokens(deliveryPartner);

    return reply.status(200).send({
        message: Messages.LOGIN_SUCCESS,
        ...tokens,
        user: {
            id: deliveryPartner._id,
            email: deliveryPartner.email,
            role: deliveryPartner.role,
        },
    });
});

export const refreshToken = tryCatchWrapper(async (req, reply) => {
    const token = req.body.refreshToken;

    if (!token) {
        return reply.status(400).send({
            message: Messages.TOKEN_REQUIRED,
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return reply.status(403).send({
            message: Messages.TOKEN_INVALID,
        });
    }

    let user;
    if (decoded.role === "Customer") {
        user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
        user = await DeliveryPartner.findById(decoded.userId);
    } else {
        return reply.status(403).send({
            message: Messages.INVALID_ROLE,
        });
    }

    if (!user) {
        return reply.status(404).send({
            message: Messages.USER_NOT_FOUND,
        });
    }

    const tokens = generateTokens(user);

    return reply.status(200).send({
        message: Messages.TOKENS_REFRESHED,
        ...tokens,
        user: {
            id: user._id,
            phone: user.phone || undefined,
            email: user.email || undefined,
            role: user.role,
        },
    });
});

export const fetchUser = tryCatchWrapper(async (req, reply) => {
    const { userId, role } = req.params;
    let user;
    if (role === "Customer") {
        user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
        user = await DeliveryPartner.findById(userId);
    } else {
        return reply.status(400).send({
            message: Messages.INVALID_ROLE,
        });
    }
    if (!user) {
        return reply.status(404).send({
            message: Messages.USER_NOT_FOUND,
        });
    }
    return reply.status(200).send({
        message: Messages.USER_FETCH_SUCCESS,
        user: {
            id: user._id,
            phone: user.phone || undefined,
            email: user.email || undefined,
            role: user.role,
        },
    });
});
