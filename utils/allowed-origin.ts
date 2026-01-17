export function isAllowedOrigin(origin?: string, reqMethod?: string): boolean {
  if (!origin) return true;
  if (reqMethod && reqMethod.toUpperCase() === "OPTIONS") return true;

  // Shopify-specific domain patterns
  if (/https?:\/\/([\w.-]+)\.myshopify\.com$/.test(origin)) return true; // Store domains
  if (/https?:\/\/([\w.-]+)\.shopify\.com$/.test(origin)) return true;   // Admin domains
  
  // Development and deployment domains
  if (/https?:\/\/([\w.-]+)\.onrender\.com$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/.*\.trycloudflare\.com$/.test(origin)) return true;
  
  return false;
}
