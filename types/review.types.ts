import { Document } from "mongoose";

export interface ReviewSliderDocument extends Document {
    title: string;
    description: string;
}
