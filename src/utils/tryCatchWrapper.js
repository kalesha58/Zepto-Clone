export const tryCatchWrapper = (handler) => {
    return async (req, reply) => {
        try {
            await handler(req, reply);
        } catch (error) {
            console.error(`${handler.name || 'Handler'} error:`, error);
            return reply.status(500).send({
                message: "Internal server error",
                error: error.message,
            });
        }
    };
};