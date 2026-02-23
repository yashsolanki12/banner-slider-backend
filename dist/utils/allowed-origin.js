export function isAllowedOrigin(origin, reqMethod) {
    if (!origin)
        return true;
    if (reqMethod && reqMethod.toUpperCase() === "OPTIONS")
        return true;
    const allowedOrigins = ["https://banner-slider-web.onrender.com"];
    if (allowedOrigins.includes(origin))
        return true;
    // Shopify-specific domain patterns
    if (/https?:\/\/([\w.-]+)\.myshopify\.com$/.test(origin))
        return true; // Store domains
    if (/https?:\/\/([\w.-]+)\.shopify\.com$/.test(origin))
        return true; // Admin domains
    // Shopify CDN and checkout domains
    if (/https?:\/\/([\w.-]+)\.cdn\.shopify\.com$/.test(origin))
        return true;
    if (/https?:\/\/checkout\.shopify\.com$/.test(origin))
        return true;
    if (/https?:\/\/([\w.-]+)\.shopifycdn\.com$/.test(origin))
        return true;
    // Development and deployment domains
    if (/https?:\/\/([\w.-]+)\.onrender\.com$/.test(origin))
        return true;
    if (/^http:\/\/localhost:\d+$/.test(origin))
        return true;
    if (/.*\.trycloudflare\.com$/.test(origin))
        return true;
    // Allow all HTTPS origins for public storefront API (for theme embed)
    // This allows the Shopify theme to call the public API
    if (/^https:\/\//.test(origin))
        return true;
    return false;
}
//# sourceMappingURL=allowed-origin.js.map