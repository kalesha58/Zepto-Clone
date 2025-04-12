import messages from "../../constants/messages";
import Category from "../../models/category";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";

export  const getAllCategories = tryCatchWrapper(async (req, reply) => {
    const categories = await Category.find();
    return reply.status(200).send({
        message: messages.CATEGORIES_FETCH_SUCCESS,
        categories,
    });
});