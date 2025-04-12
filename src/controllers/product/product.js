import Product from '../../models/product.js';
import { tryCatchWrapper } from '../../utils/tryCatchWrapper.js';
import Messages from '../../constants/messages.js';
import { StatusCodes } from '../../constants/messages.js';


export const getProductsByCategoryId = tryCatchWrapper(async (req, reply) => {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).select('-category').exec();
    return reply.status(StatusCodes.OK).send({
        message: Messages.PRODUCTS_FETCH_SUCCESS,
        products,
    });
});