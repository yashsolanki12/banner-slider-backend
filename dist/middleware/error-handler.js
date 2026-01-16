import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
export const errorHandler = (error, _req, res, _next) => {
    return res
        .status(error.status || StatusCode.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(false, error.message || "Something went wrong", null));
};
//# sourceMappingURL=error-handler.js.map