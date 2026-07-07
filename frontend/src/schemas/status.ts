import { z } from 'zod';

export const CpuInfoSchema = z.object({
  cores: z.number().int().optional(),
  speedMhz: z.number().optional(),
  model: z.string().optional(),
});

export const MemInfoSchema = z.object({
  current: z.number().int().optional(),
  total: z.number().int().optional(),
  free: z.number().int().optional(),
});

export const DiskInfoSchema = z.object({
  current: z.number().int().optional(),
  total: z.number().int().optional(),
  free: z.number().int().optional(),
});

export const NetStatSchema = z.object({
  up: z.number().int().optional(),
  down: z.number().int().optional(),
});

export const StatusSchema = z.object({
  cpu: z.number().optional(),
  cpuInfo: CpuInfoSchema.optional(),
  mem: MemInfoSchema.optional(),
  disk: DiskInfoSchema.optional(),
  net: NetStatSchema.optional(),
  uptime: z.number().int().optional(),
  xray: z.object({
    state: z.string().optional(),
    version: z.string().optional(),
    errorMsg: z.string().optional(),
  }).optional(),
}).passthrough();

export type Status = z.infer<typeof StatusSchema>;
