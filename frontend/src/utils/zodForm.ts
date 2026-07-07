import type { z } from 'zod';
import type { RuleObject } from 'antd/es/form';
import type { TFunction } from 'i18next';

export function antdRule<S extends z.ZodTypeAny>(
  schema: S,
  _t?: TFunction,
): RuleObject {
  return {
    validator: (_: RuleObject, value: unknown) => {
      const result = schema.safeParse(value);
      if (result.success) return Promise.resolve();
      const issue = result.error.issues[0];
      return Promise.reject(new Error(issue?.message ?? 'Invalid value'));
    },
  };
}
