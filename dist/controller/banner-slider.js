import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import * as bannerSliderService from "../service/banner-slider.js";
import mongoose from "mongoose";
// Create
export const createBannerSlider = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description are required."));
        }
        const response = await bannerSliderService.createBanner({
            title,
            description,
        });
        if (!response) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Failed to create new banner slider."));
        }
        if (response) {
            return res
                .status(StatusCode.CREATED)
                .json(new ApiResponse(true, "Banner slider created successfully.", response));
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
export const getAllBannerSlider = async (_req, res, next) => {
    try {
        const response = await bannerSliderService.getAllBanner();
        if (!response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(false, "No banner slider found.", []));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Banner slider retrieved successfully", response));
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
export const getBannerSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid banner slider ID format."));
        }
        const response = await bannerSliderService.getBannerById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Banner slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Banner slider retrieved successfully.", response));
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
export const updateBannerSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid banner slider ID format."));
        }
        if (!title || !description) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description are required."));
        }
        const response = await bannerSliderService.updateBannerById(id, {
            title,
            description,
        });
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Banner slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Banner slider updated successfully.", response));
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
export const deleteBannerSliderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid banner slider ID format."));
        }
        const response = bannerSliderService.deleteBannerById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Banner slider not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Banner slider deleted successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
//# sourceMappingURL=banner-slider.js.map