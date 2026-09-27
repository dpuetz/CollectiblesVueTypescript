import { z } from 'zod';

export const LoginResponseSchema = z.object({
  token: z.string(),
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  groups: z.array(z.string()),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export function validateLoginResponse(
  data: unknown,
): { success: true; data: LoginResponse } | { success: false; error: string } {
  const result = LoginResponseSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    };
  }
  return { success: true, data: result.data };
}
