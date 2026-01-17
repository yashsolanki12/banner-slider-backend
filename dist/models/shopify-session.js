import { Schema, model } from "mongoose";
const shopifySessionSchema = new Schema({
    id: String,
    shop: String,
    state: String,
    isOnline: Boolean,
    scope: String,
    accessToken: String,
}, { collection: "shopify_sessions" });
export default model("ShopifySession", shopifySessionSchema);
//# sourceMappingURL=shopify-session.js.map