import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20, 'Invalid verification token'),
});

export const aiImageGenerationSchema = z.object({
  prompt: z.string().min(3, 'Prompt is required').max(1000, 'Prompt too long'),
  model: z.enum(['dalle3', 'dalle2']).default('dalle3'),
  size: z.enum(['1024x1024', '1024x1792', '1792x1024']).default('1024x1024'),
  style: z.string().max(100).optional(),
  n: z.number().int().positive().max(4).optional().default(1),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
  data: z.any(),
  thumbnail: z.string().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

export const projectUpdateSchema = projectSchema.partial();

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
};

export const paramsSchema = z.object({
  id: z.preprocess(parsePositiveInt, z.number().int().positive()),
});

export const projectVersionParamsSchema = z.object({
  id: z.preprocess(parsePositiveInt, z.number().int().positive()),
  versionId: z.preprocess(parsePositiveInt, z.number().int().positive()),
});

export const shareParamsSchema = z.object({
  id: z.preprocess(parsePositiveInt, z.number().int().positive()),
  shareId: z.preprocess(parsePositiveInt, z.number().int().positive()),
});

export const paginationQuerySchema = z.object({
  page: z.preprocess(parsePositiveInt, z.number().int().positive()).default(1),
  limit: z.preprocess(parsePositiveInt, z.number().int().positive().max(100)).default(20),
});

export const projectVersionCreateSchema = z.object({
  name: z.string().max(100).optional(),
  data: z.any(),
  thumbnail: z.string().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});

export const shareCreateSchema = z.object({
  canEdit: z.boolean().optional().default(false),
  expiresIn: z.number().int().positive().max(60 * 60 * 24 * 365).optional(),
});

export const templateCreateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50).optional(),
  thumbnail: z.string().optional().nullable(),
  data: z.any(),
  width: z.number().int().positive().max(8000).optional(),
  height: z.number().int().positive().max(8000).optional(),
  backgroundColor: z.string().max(20).optional(),
  isPublic: z.boolean().optional(),
});
