import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
export const errorHandler = (error, _req, res, _next) => {
    console.error("❌ Error caught by errorHandler:", error.message);
    const status = error.status || StatusCode.INTERNAL_SERVER_ERROR;
    const message = error.message || "Something went wrong";
    return res.status(status).json(new ApiResponse(false, message, null));
};
//# sourceMappingURL=error-handler.js.map