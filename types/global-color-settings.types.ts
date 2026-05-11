import mongoose, { Document } from "mongoose";

export interface GlobalColorSettingsDocument extends Document {
  shopify_session_id: mongoose.Types.ObjectId;
  backgroundColor: string;
  titleColor: string;
  descriptionColor: string;
  iconBackgroundColor: string;
  iconColor: string;
  itemBorderRightColor: string;
  itemBackgroundColor: string;
  slideSpeed: number;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  createdAt: Date;
  updatedAt: Date;
}
