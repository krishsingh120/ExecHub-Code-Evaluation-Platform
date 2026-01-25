const BaseError = require("./base.error.js");
const { StatusCodes } = require("http-status-codes");

class BadRequest extends BaseError {
    constructor(propertyName, details) {
        super(
            "Bad Request",
            StatusCodes.BAD_REQUEST,
            `Invalid structure for ${propertyName} provided`,
            details
        );

    }
}

module.exports = BadRequest;