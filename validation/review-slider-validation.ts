import { z } from "zod";

export const reviewSliderSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: "Title must be at least 3 character" }),
    description: z
      .string()
      .min(5, { message: "Description must be at least 5 character" }),
  }),
});