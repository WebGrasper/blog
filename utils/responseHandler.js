/**
 * Unified response handler to standardize API responses
 */
const sendResponse = (res, statusCode, message, data = {}) => {
    res.status(statusCode).json({
        success: true,
        message,
        ...data
    });
};

module.exports = sendResponse;
