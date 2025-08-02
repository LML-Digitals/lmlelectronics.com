import * as z from "zod";

export const stockLevelSchema = z.object({
  stock: z.number().min(0, "Stock cannot be negative"),
  purchaseCost: z.number().optional(),
});

export const variationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variation name is required"),
  sku: z.string().min(1, "SKU is required"),
  raw: z.number().optional(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  markup: z.number().optional(),
  visible: z.boolean().optional(),
  useDefaultRates: z.boolean().optional(),
  image: z.string().nullable(),
  stockLevels: z.record(z.string(), stockLevelSchema),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().nullable(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  supplierId: z.number().nullable(),
  warrantyTypeId: z.string().nullable().optional(),
  variations: z.array(variationSchema).optional(),
  tagIds: z.array(z.string()).optional(),
});
