import { z } from 'zod';

export const FinalMaskStreamSettingsSchema = z.record(z.unknown()).default({});

export type FinalMaskStreamSettings = z.infer<typeof FinalMaskStreamSettingsSchema>;
