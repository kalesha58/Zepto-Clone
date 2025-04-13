import messages from "../../constants/messages.js";
import Category from "../../models/category.js";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper.js";

export  const getAllCategories = tryCatchWrapper(async (req, reply) => {
    const categories = await Category.find();
    return reply.status(200).send({
        message: messages.CATEGORIES_FETCH_SUCCESS,
        categories,
    });
});