"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = void 0;
class RequestError {
    constructor(message, details, error) {
        this.message = "";
        this.details = "";
        this.message = message;
        this.details = details;
        this.error = error;
    }
}
exports.RequestError = RequestError;
//# sourceMappingURL=serverErrors.js.map