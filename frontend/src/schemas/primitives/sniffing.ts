import { z } from 'zod';

export const SniffingSchema = z.object({
  enabled: z.boolean().default(false),
  destOverride: z.array(z.enum(['http', 'tls', 'quic', 'fakedns'])).default([]),
  metadataOnly: z.boolean().default(false),
  routeOnly: z.boolean().default(false),
  ipsExcluded: z.array(z.string()).default([]),
  domainsExcluded: z.array(z.string()).default([]),
});

export type Sniffing = z.infer<typeof SniffingSchema>;
