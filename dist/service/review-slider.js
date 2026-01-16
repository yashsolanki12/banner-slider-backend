import { ReviewSlider } from "../models/review-slider.js";
// Create new review slider
export const createReview = async (data) => {
    return await ReviewSlider.create({
        title: data.title,
        description: data.description,
    });
};
// Get all review slider
export const getAllReview = async () => {
    return await ReviewSlider.find().sort({ createdAt: -1 });
};
// Get by id
export const getReviewById = async (id) => {
    return await ReviewSlider.findById(id);
};
// Update
export const updateReviewById = async (id, data) => {
    return await ReviewSlider.findByIdAndUpdate(id, data, { new: true });
};
// Delete
export const deleteReviewById = async (id) => {
    return await ReviewSlider.findByIdAndDelete(id);
};
//# sourceMappingURL=review-slider.js.map