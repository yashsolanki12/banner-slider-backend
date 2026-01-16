import { ApiResponse } from "../utils/api-response.js";
import { z } from "zod";
import { StatusCode } from "../utils/status-code.js";
export const validate = (schema) => (req, res, next) => {
    if (!req.body) {
        return res
            .status(StatusCode.BAD_REQUEST)
            .json(new ApiResponse(false, "Request body is required"));
    }
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(error._zod.def.map((i) => i.message));
        }
        res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
//# sourceMappingURL=validate.js.map