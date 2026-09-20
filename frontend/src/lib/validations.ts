import { z } from 'zod';

export const citizenReportSchema = z.object({
  mode: z.enum(['photo', 'gallery', 'voice'] as const),
  category: z
    .enum([
      'fire',
      'accident',
      'flood',
      'medical',
      'chemical',
      'infrastructure',
      'natural',
      'other',
    ] as const)
    .optional(),
  description: z
    .string()
    .max(300, { message: 'Description cannot exceed 300 characters' })
    .optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
    area: z.string().optional(),
  }),
  anonymous: z.boolean().optional(),
  contactNumber: z
    .string()
    .regex(/^[0-9+() -]*$/, { message: 'Invalid phone number format' })
    .optional(),
});

export type CitizenReportFormData = z.infer<typeof citizenReportSchema>;
