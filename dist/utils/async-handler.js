/**
 * Higher-order function that wraps async route handlers
 * and automatically catches errors, passing them to next()
 *
 * @param fn - The async route handler function to wrap
 * @returns A RequestHandler that handles errors automatically
 *
 * @example
 * // Before (repetitive try-catch):
 * export const getData = async (req, res, next) => {
 *   try {
 *     const data = await service.getData();
 *     return res.json(new ApiResponse(true, "Success", data));
 *   } catch (error) {
 *     next(error);
 *     return res
 *       .status(StatusCode.INTERNAL_SERVER_ERROR)
 *       .json(new ApiResponse(false, "Internal Server Error"));
 *   }
 * };
 *
 * // After (using asyncHandler):
 * export const getData = asyncHandler(async (req, res, next) => {
 *   const data = await service.getData();
 *   return res.json(new ApiResponse(true, "Success", data));
 * });
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=async-handler.js.map