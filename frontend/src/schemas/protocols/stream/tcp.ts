import { z } from 'zod';

export const TcpStreamSettingsSchema = z.object({
  acceptProxyProtocol: z.boolean().default(false),
  header: z.object({
    type: z.string().default('none'),
    request: z.unknown().optional(),
    response: z.unknown().optional(),
  }).default({}),
}).default({});

export type TcpStreamSettings = z.infer<typeof TcpStreamSettingsSchema>;
