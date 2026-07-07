import { z } from 'zod';

export const GrpcStreamSettingsSchema = z.object({
  serviceName: z.string().default(''),
  authority: z.string().default(''),
  multiMode: z.boolean().default(false),
  idle_timeout: z.number().int().optional(),
  health_check_timeout: z.number().int().optional(),
  permit_without_stream: z.boolean().optional(),
  initial_windows_size: z.number().int().optional(),
}).default({});

export type GrpcStreamSettings = z.infer<typeof GrpcStreamSettingsSchema>;
