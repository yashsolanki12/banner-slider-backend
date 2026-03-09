import mongoose from "mongoose";
import { GlobalColorSettings } from "../models/global-color-settings.js";
// Default color settings for any store
const DEFAULT_COLOR_SETTINGS = {
    backgroundColor: "#f8f9fa",
    titleColor: "#333333",
    descriptionColor: "#666666",
    iconBackgroundColor: "#4CAF50",
    iconColor: "#ffffff",
    itemBorderRightColor: "#000000",
    itemBackgroundColor: "#ffffff",
    slideSpeed: 4,
};
// Get default color settings
export const getDefaultColorSettings = () => {
    return { ...DEFAULT_COLOR_SETTINGS };
};
// Create or update global color settings
export const setGlobalColorSettings = async (shopify_session_id, colors) => {
    const sessionId = new mongoose.Types.ObjectId(shopify_session_id);
    const globalSettings = await GlobalColorSettings.findOneAndUpdate({ shopify_session_id: sessionId }, { $set: colors }, { upsert: true, returnDocument: "after" });
    return globalSettings;
};
// Get global color settings by shopify session id
export const getGlobalColorSettings = async (shopify_session_id) => {
    const sessionId = new mongoose.Types.ObjectId(shopify_session_id);
    return await GlobalColorSettings.findOne({ shopify_session_id: sessionId });
};
// Delete global color settings
export const deleteGlobalColorSettings = async (shopify_session_id) => {
    const sessionId = new mongoose.Types.ObjectId(shopify_session_id);
    return await GlobalColorSettings.findOneAndDelete({
        shopify_session_id: sessionId,
    });
};
// Get global colors as plain object (for applying to list items)
export const getGlobalColorsPlain = async (shopify_session_id) => {
    const settings = await getGlobalColorSettings(shopify_session_id);
    // Return default color settings if none exist for this store
    if (!settings) {
        return getDefaultColorSettings();
    }
    return {
        itemBorderRightColor: settings.itemBorderRightColor,
        backgroundColor: settings.backgroundColor,
        itemBackgroundColor: settings.itemBackgroundColor,
        titleColor: settings.titleColor,
        descriptionColor: settings.descriptionColor,
        iconBackgroundColor: settings.iconBackgroundColor,
        iconColor: settings.iconColor,
        slideSpeed: settings.slideSpeed,
    };
};
//# sourceMappingURL=global-color-settings.js.map