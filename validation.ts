import { z } from "zod";

// Central input schemas — every sensitive route validates against one of these.

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(128),
  portalType: z.enum(["staff", "admin"]).optional(),
});

export const paymentProfileSchema = z.object({
  platform: z.string().min(2, "Platform name is required").max(80),
  accountNumber: z.string().min(3, "Account number is required").max(40),
  deepLink: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(120).optional(),
  title_en: z.string().min(1).max(120).optional(),
  title_local: z.string().max(80).optional(),
  category: z.string().min(1).max(40).optional(),
  price: z.coerce.number().min(0, "Price must be a non-negative number").max(100_000_000),
  description: z.string().max(2000).optional(),
  is_vegan: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  imageUrl: z.string().max(2000).optional(),
  imageSource: z.string().max(30).optional(),
});

export const menuItemUpdateSchema = menuItemSchema
  .partial()
  .and(z.object({ price: z.coerce.number().min(0, "Price must be a non-negative number").max(100_000_000).optional() }));

export const menuBatchItemSchema = menuItemSchema.partial();

export const menuBatchSchema = z.object({
  items: z.array(menuBatchItemSchema).min(1, "At least one menu item is required").max(200),
});

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  username: z.string().min(1, "Username is required").max(40),
  password: z.string().min(4, "Password must be at least 4 characters").max(128),
  assignedTable: z.string().max(40).optional(),
});

export const adminMerchantSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(120),
  username: z.string().min(1, "Username is required").max(40),
  password: z.string().min(5, "Password must be at least 5 characters").max(128),
  billingType: z.enum(["permanent", "temporary"]).optional(),
  accountType: z.enum(["normal", "menu"]).optional(),
  requiresPaymentAuthenticator: z.boolean().optional(),
  staffAccountModel: z.enum(["single", "multi_waiters"]).optional(),
  serviceStatus: z.enum(["active", "paused"]).optional(),
  logoBase64: z.string().max(5_000_000).optional(),
  appInstallEnabled: z.boolean().optional(),
});

export const adminMerchantUpdateSchema = adminMerchantSchema.partial();

export const imagePayloadSchema = z.object({
  imageBase64: z.string().min(100, "Image data is required").max(50_000_000),
  mimeType: z.string().max(30).optional(),
  tableNumber: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  lang: z.enum(["en", "am"]).optional(),
});

export const itemLookupSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
});

export const assistantSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(6000),
});

export const translateSchema = z.object({
  texts: z.array(z.string().max(6000)).min(1).max(8),
  targetLang: z.enum(["en", "am"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z.string().min(5, "New password must be at least 5 characters").max(128),
});

export const updateProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(120),
  username: z.string().min(1, "Username is required").max(40),
  logoBase64: z.string().max(5_000_000).optional(),
});

// Validate payload, returning a plain error string on failure (never throws)
export function parseOrFail(
  schema: z.ZodType,
  data: unknown
): { ok: true; data: any } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues
        .map((i) => `${i.path.length ? i.path.join(".") : "body"}: ${i.message}`)
        .join("; "),
    };
  }
  return { ok: true, data: result.data };
}