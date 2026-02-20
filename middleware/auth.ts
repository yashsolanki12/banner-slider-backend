import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";

export const validateShopifyHeader = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(
    "[Middleware] validateShopifyHeader called:",
    req.headers["x-shopify-shop-domain"],
  );
  const shopDomain = req.headers["x-shopify-shop-domain"];

  if (!shopDomain) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json(
        new ApiResponse(
          false,
          "Missing shop domain header (x-shopify-shop-domain).",
        ),
      );
  }

  next(); // Header exists, proceed to controller
};
