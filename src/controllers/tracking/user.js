import { Customer, DeliveryPartner } from "../../models/user.js";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper.js";
import Messages from "../../constants/messages.js";
import { UserRoles } from "../../constants/roles.js";
import  StatusCodes  from "../../constants/messages.js"

/**
 * Updates the currently authenticated user's information.
 *
 * @route PATCH /api/user/update
 * @access Private (requires authentication)
 *
 * @param {Object} req - The request object, containing the authenticated user's ID and update data.
 * @param {Object} reply - The Fastify reply object used to send the response.
 *
 * @returns {Object} 200 - User updated successfully
 * @returns {Object} 400 - Invalid input or role
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Internal server error
 */
export const updateUser = tryCatchWrapper(async (req, reply) => {
    const { userId } = req.user;
    const updateData = req.body;

    // Guard: reject if no update fields provided
    if (!updateData || Object.keys(updateData).length === 0) {
        return reply.status(StatusCodes.BAD_REQUEST).send({
            message: Messages.UPDATE_DATA_REQUIRED,
        });
    }

    // Guard: prevent updates to restricted fields
    const forbiddenFields = ["_id", "role", "password"];
    for (let key of forbiddenFields) {
        if (key in updateData) {
            return reply.status(StatusCodes.BAD_REQUEST).send({
                message: `${key} cannot be updated`,
            });
        }
    }

    // Find user by ID
    let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

    if (!user) {
        return reply.status(StatusCodes.NOT_FOUND).send({
            message: Messages.USER_NOT_FOUND,
        });
    }

    // Choose correct model based on role
    let userModel;
    switch (user.role) {
        case UserRoles.CUSTOMER:
            userModel = Customer;
            break;
        case UserRoles.DELIVERY_PARTNER:
            userModel = DeliveryPartner;
            break;
        default:
            return reply.status(StatusCodes.BAD_REQUEST).send({
                message: Messages.INVALID_ROLE,
            });
    }

    // Update and return the new user
    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: Messages.INTERNAL_SERVER_ERROR,
        });
    }

    return reply.status(StatusCodes.OK).send({
        message: Messages.USER_UPDATE_SUCCESS,
        user: updatedUser,
    });
});
