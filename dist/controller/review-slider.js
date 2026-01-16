import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import * as reviewSliderService from "../service/review-slider.js";
import mongoose from "mongoose";
// Create
export const createReviewSlider = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description are required."));
        }
        const response = await reviewSliderService.createReview({
            title,
            description,
        });
        if (!response) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Failed to create new review slider."));
        }
        if (response) {
            return res
                .status(StatusCode.CREATED)
                .json(new ApiResponse(true, "Review slider created successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// List
export const getAllReviewSlider = async (_req, res, next) => {
    try {
        const response = await reviewSliderService.getAllReview();
        if (!response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(false, "No review slider found.", []));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Review slider retrieved successfully", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Detail
export const getReviewSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid review slider ID format."));
        }
        const response = await reviewSliderService.getReviewById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Review slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Review slider retrieved successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Update
export const updateReviewSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid review slider ID format."));
        }
        if (!title || !description) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description are required."));
        }
        const response = await reviewSliderService.updateReviewById(id, {
            title,
            description,
        });
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Review slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Review slider updated successfully."));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Delete
export const deleteReviewSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid review slider ID format."));
        }
        const response = reviewSliderService.deleteReviewById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Review slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Review slider deleted successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
//# sourceMappingURL=review-slider.js.map