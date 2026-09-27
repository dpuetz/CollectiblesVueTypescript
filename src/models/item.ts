import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  categoryIcon: z.boolean(),
  imageUrl: z.string(),
  circa: z.number(),
});

export type Item = z.infer<typeof ItemSchema>;

export const ItemsSchema = z.array(ItemSchema);

export function validateItem(data: unknown): { success: true; data: Item } | { success: false; error: string } {
  const result = ItemSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  return { success: true, data: result.data };
}

export interface InvalidItemDetail {
  index: number;
  itemId: number | string;
  issues: z.core.$ZodIssue[];
}

export interface PartialValidationResult {
  validItems: Item[];
  invalidDetails: InvalidItemDetail[];
  allValid: boolean;
}

// Validates an array element-by-element, keeping valid items instead of failing the whole batch
export function validateItemsPartial(json: unknown): PartialValidationResult {
  if (!Array.isArray(json)) {
    return { validItems: [], invalidDetails: [], allValid: false };
  }

  const validItems: Item[] = [];
  const invalidDetails: InvalidItemDetail[] = [];

  json.forEach((entry, index) => {
    const result = ItemSchema.safeParse(entry);
    if (result.success) {
      validItems.push(result.data);
    } else {
      const itemId = entry && typeof entry === 'object' && 'id' in entry ? (entry as { id: unknown }).id : '(unknown)';
      invalidDetails.push({
        index,
        itemId: itemId as number | string,
        issues: result.error.issues,
      });
    }
  });

  return { validItems, invalidDetails, allValid: invalidDetails.length === 0 };
}
