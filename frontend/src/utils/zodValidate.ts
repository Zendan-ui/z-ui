import type { z } from 'zod';
import type { Msg } from '@/utils';

export function parseMsg<S extends z.ZodTypeAny>(
  msg: Msg<unknown> | null | undefined,
  schema: S,
  _context?: string,
): Msg<z.infer<S>> {
  if (!msg) {
    return { success: false, msg: 'No response', obj: undefined as z.infer<S> };
  }
  const result = schema.safeParse(msg.obj);
  if (result.success) {
    return { success: msg.success, msg: msg.msg, obj: result.data as z.infer<S> };
  }
  return { success: msg.success, msg: msg.msg, obj: msg.obj as z.infer<S> };
}
