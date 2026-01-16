import mongoose from "mongoose";
import { MongoDBConnectionProps } from "../types/db.types";

export async function connectDB(config: MongoDBConnectionProps): Promise<void> {
  try {
    await mongoose.connect(config.url, {
      dbName: config.dbName,
    });
    console.log("Connected with MongoDB 🛢️");
  } catch (error: any) {
    console.log("Failed to connect with MongoDB", error);
    process.exit(1);
  }
}
