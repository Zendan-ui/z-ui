import { z } from 'zod';

export const LoginFormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  loginSecret: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const TwoFactorCodeSchema = z.object({
  code: z.string().length(6),
});

export type TwoFactorCodeValues = z.infer<typeof TwoFactorCodeSchema>;
