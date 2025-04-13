import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Insert categories
        const categoryDocs = await Category.insertMany(categories);

        // Map category names to IDs
        const categoryMap = categoryDocs.reduce((acc, category) => {
            acc[category.name] = category._id;
            return acc;
        }, {});

        // Attach category IDs to products
        const productsWithCategory = products.map((product) => ({
            ...product,
            category: categoryMap[product.category],
        }));

        // Insert products
        await Product.insertMany(productsWithCategory);

        console.log("✅ Database seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
