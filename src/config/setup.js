import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes"
import * as Models  from "../models/index.js";

AdminJS.registerAdapter(AdminJSMongoose);

export const adminJs = new AdminJS({
    resources: [
        {
            resource: Models.Customer,
            options: {
                listProperties: ['phone', 'role', 'isActivated'],
                filterProperties: ["phone", "role"],
            },

        },
        {
            resource: Models.DeliveryPartner,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ["email", "role"],
            },
        },

        {
            resource: Models.Admin,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ["email", "role"],
            },
        },
        { resource: Models.Branch },
        { resource: Models.Product },
        { resource: Models.Order },
        { resource: Models.Counter },
        { resource: Models.Category },
    ],
    branding: {
        companyName: "Delivery App",
        softwareBrothers: "Delivery App",
        withMadeWithLove: false,
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: "/admin",
});


export const buildAdminRouter = async (fastify) => {
    await AdminJSFastify.buildAuthenticatedRouter(adminJs,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: 'adminjs',
            store: sessionStore
        },
        fastify,
        {
            store: sessionStore,
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    )
}