import { Document } from "mongoose";

export interface ShopifySession extends Document {
  id: string;
  shop: string;
  state: string;
  isOnline: string;
  scope: string;
  accessToken: string;
}
