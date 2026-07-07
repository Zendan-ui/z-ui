import { z } from 'zod';
import { HostSchema } from '@/generated/zod';

export { HostSchema };
export type HostRecord = z.infer<typeof HostSchema>;

export const HostListSchema = z.array(HostSchema);
export type HostList = z.infer<typeof HostListSchema>;
