import { Document, Types } from "mongoose";

export interface DesignSettings {
  backgroundColor: string;
  itemBackgroundColor: string;
  titleColor: string;
  descriptionColor: string;
  iconBackgroundColor: string;
  iconColor: string;
  slideSpeed: number;
}

export interface UspSliderDocument extends Document {
  title: string;
  description: string;
  shopify_session_id?: Types.ObjectId;
  designSettings: DesignSettings;
  enabled: boolean;
}
