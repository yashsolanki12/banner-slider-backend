import { z } from "zod";

export const uspSliderSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: "Title must be at least 3 character" }),
    description: z
      .string()
      .min(5, { message: "Description must be at least 5 character" }),
    designSettings: z
      .object({
        backgroundColor: z.string().optional(),
        itemBackgroundColor: z.string().optional(),
        titleColor: z.string().optional(),
        descriptionColor: z.string().optional(),
        iconBackgroundColor: z.string().optional(),
        iconColor: z.string().optional(),
        slideSpeed: z.number().min(2).max(10).optional(),
      })
      .optional(),
  }),
});
