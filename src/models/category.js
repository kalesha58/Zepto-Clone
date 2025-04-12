import mongoose from "mongoose";

const categoryShema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
})

const Category = mongoose.model("Category", categoryShema);

export default Category;