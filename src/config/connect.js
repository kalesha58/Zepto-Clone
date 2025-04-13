import mongoose from "mongoose";
export const connectDB = async (mongoUrl) => {
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.error(err); // full stack trace
        process.exit(1);
    }
};
