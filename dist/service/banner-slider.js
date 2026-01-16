import { BannerSlider } from "../models/banner-slider.js";
// Create new banner slider
export const createBanner = async (data) => {
    return await BannerSlider.create({
        title: data.title,
        description: data.description,
    });
};
// Get all banner slider
export const getAllBanner = async () => {
    return await BannerSlider.find().sort({ createdAt: -1 });
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