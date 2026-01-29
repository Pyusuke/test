import { z } from 'zod';

export const SiteIdSchema = z.enum([
  'monotaro',
  'misumi',
  'amazon',
  'hobuhin',
  'askul',
  'axel',
  'aperza',
]);

export type SiteId = z.infer<typeof SiteIdSchema>;

export const PriceSchema = z.object({
  amount: z.number(),
  currency: z.literal('JPY'),
  taxIncluded: z.boolean(),
  unit: z.string().optional(),
});

export type Price = z.infer<typeof PriceSchema>;

export const AvailabilityStatusSchema = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'made_to_order',
  'unknown',
]);

export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;

export const AvailabilitySchema = z.object({
  status: AvailabilityStatusSchema,
  leadTime: z.string().optional(),
  quantity: z.number().optional(),
});

export type Availability = z.infer<typeof AvailabilitySchema>;

export const ImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

export type Image = z.infer<typeof ImageSchema>;

export const SpecificationSchema = z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
});

export type Specification = z.infer<typeof SpecificationSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  source: SiteIdSchema,
  url: z.string().url(),
  name: z.string(),
  partNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  price: PriceSchema,
  availability: AvailabilitySchema,
  images: z.array(ImageSchema),
  specifications: z.array(SpecificationSchema).optional(),
  fetchedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export const SITE_INFO: Record<SiteId, { name: string; url: string }> = {
  monotaro: { name: 'モノタロウ', url: 'https://www.monotaro.com' },
  misumi: { name: 'ミスミ', url: 'https://jp.misumi-ec.com' },
  amazon: { name: 'Amazon', url: 'https://www.amazon.co.jp' },
  hobuhin: { name: '保守部品.com', url: 'https://hoshubuhin.com' },
  askul: { name: 'ASKUL', url: 'https://www.askul.co.jp' },
  axel: { name: 'AXEL', url: 'https://axel.as-1.co.jp' },
  aperza: { name: 'アペルザ', url: 'https://www.aperza.com' },
};
