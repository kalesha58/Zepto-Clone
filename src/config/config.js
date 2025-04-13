import "dotenv/config.js"
import fastifySession from '@fastify/session'
import ConnectMongoDBSession from 'connect-mongodb-session'
import { Admin } from "../models/index.js"

export const PORT = process.env.PORT || 3000
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD

const MongoseDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoseDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions',
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
})

sessionStore.on('error', function (error) {
    console.log(error)
})

export const authenticate = async (email, password) => {
    if (!email || !password) return false
   
    // if (email && password) {
    //     if (email === 'moon@gmail.com' && password === "moon123") {
    //         return Promise.resolve({ email: email, password: password })
    //     } else {
    //         return null
    //     }
    // }

//    UNCOMMENT THIS WHEN CREATED ADMIN MANUALLY
    if (email && password) {
        const user = await Admin.findOne({ email })
        if (!user) return null
        if (user.password === password) {
            return Promise.resolve({ email: email, password: password })
        } else {
            return null
        }
    }
}

