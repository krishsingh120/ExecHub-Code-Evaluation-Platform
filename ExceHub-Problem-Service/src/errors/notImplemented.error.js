// notImplemented.error.js
const BaseError = require("./base.error.js");
const { StatusCodes } = require("http-status-codes");

class NotImplemented extends BaseError {
    constructor(methodName) {
        super(
            "Not Implemented",
            StatusCodes.NOT_IMPLEMENTED,
            `${methodName} Not Implemented`,
            {}
        );
    }
}
module.exports = NotImplemented;
