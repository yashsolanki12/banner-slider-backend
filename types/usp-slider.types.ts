import { Document, Types } from "mongoose";

export interface UspSliderDocument extends Document {
  title: string;
  description: string;
  shopify_session_id?: Types.ObjectId;
}
