import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().default("SERVICE"),
  salesPrice: z.number().int().min(0).default(0),
  costPrice: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
  description: z.string().max(2000).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createVariantSchema = z.object({
  attribute: z.string().min(1, "Attribute is required").max(100),
  value: z.string().min(1, "Value is required").max(100),
  extraPrice: z.number().int().min(0).default(0),
});

