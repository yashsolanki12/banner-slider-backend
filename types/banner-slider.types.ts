import { Document } from "mongoose";

export interface BannerSliderDocument extends Document {
    title: string;
    description: string;
}
