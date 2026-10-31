

import { z } from "zod";

export const createTaxSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  rate: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
});

export const updateTaxSchema = createTaxSchema.partial();

