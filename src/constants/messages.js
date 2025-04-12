
const Messages = {
    INTERNAL_SERVER_ERROR: "Internal server error",

    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid password",
    EMAIL_PASSWORD_REQUIRED: "Email and password are required",
    PHONE_REQUIRED: "Phone number is required",
    TOKEN_REQUIRED: "Refresh token is required",
    TOKEN_INVALID: "Invalid or expired refresh token",
    TOKENS_REFRESHED: "Tokens refreshed successfully",
    USER_NOT_FOUND: "User not found",
    USER_FETCH_SUCCESS: "User fetched successfully",
    ACCOUNT_NOT_ACTIVATED: "Account not activated. Please contact admin.",
    INVALID_ROLE: "Invalid role",
    DELIVERY_PARTNER_NOT_FOUND: "Delivery partner not found",
    CATEGORIES_FETCH_SUCCESS: "Categories fetched successfully",
    CATEGORY_FETCH_SUCCESS: "Category fetched successfully",
    PRODUCTS_FETCH_SUCCESS: "Products fetched successfully",
    PRODUCT_FETCH_SUCCESS: "Product fetched successfully",
};



const StatusCodes = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export default {Messages, StatusCodes};
