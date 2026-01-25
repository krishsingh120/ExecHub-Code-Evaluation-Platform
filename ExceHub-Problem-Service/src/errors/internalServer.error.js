const BaseError = require("./base.error.js");
const { StatusCodes } = require("http-status-codes");

class InternalServerError extends BaseError {
    constructor(details) {
        super(
            "Internal Server Error",
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong",
            details
        );

    }
}

module.exports = InternalServerError;