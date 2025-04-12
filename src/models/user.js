import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Customer", "Admin", "DeliveryPartner"],
        default: "user",
    },
    // TO check the user is activated or not
    // if not activated, the user cannot login 
    // this is only for delivery partner security if it is not activated the Delivery parter  cannot login
    isActivated: {
        type: Boolean,
        default: false,
    }
});

const custemerSchema = new mongoose.Schema({
    ...userSchema.obj,

    phone: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["Customer"],
        default: "Customer",
    },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: { type: String },


})


const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["DeliveryPartner"],
        default: "DeliveryPartner",
    },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: { type: String },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
    }
})

const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Admin"],
        default: "Admin",
    },
})


export const Customer = mongoose.model("Customer", custemerSchema);
export const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
export const Admin = mongoose.model("Admin", adminSchema);