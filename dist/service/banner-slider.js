import { BannerSlider } from "../models/banner-slider.js";
import mongoose from "mongoose";
// Create new banner slider
export const createBanner = async (data) => {
    return await BannerSlider.create({
        title: data.title,
        description: data.description,
        shopify_session_id: data.shopify_session_id
    });
};
// Get all banner slider
export const getAllBanner = async (filter = {}) => {
    const mongoFilter = { ...filter };
    if (mongoFilter.shopify_session_id) {
        mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id);
    }
    return await BannerSlider.find(mongoFilter).sort({ createdAt: -1 });
};
// Get by id
export const getBannerById = async (id) => {
    return await BannerSlider.findById(id);
};
// Update
export const updateBannerById = async (id, data) => {
    return await BannerSlider.findByIdAndUpdate(id, data, { new: true });
};
// Delete
export const deleteBannerById = async (id) => {
    return await BannerSlider.findByIdAndDelete(id);
};
//# sourceMappingURL=banner-slider.js.map