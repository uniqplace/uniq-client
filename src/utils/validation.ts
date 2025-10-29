import type { ProductPayload } from '../features/product Idea & AI/slices/aiProductTypes';

export function validateProductPayload(obj: unknown): obj is ProductPayload {
  if (!obj || typeof obj !== 'object') return false;
  const payload = obj as ProductPayload;
  if (typeof payload.sessionId !== 'string') return false;
  if (typeof payload.title !== 'string') return false;
  if (typeof payload.description !== 'string') return false;
  if (typeof payload.price !== 'number') return false;
  if (!Array.isArray(payload.images)) return false;
  if (!Array.isArray(payload.subCategories)) return false;
  if (!Array.isArray(payload.tags)) return false;
  if (!Array.isArray(payload.params)) return false;
  if (!Array.isArray(payload.audit)) return false;
  if (typeof payload.status !== 'string') return false;
  if (typeof payload.condition !== 'string') return false;
  if (typeof payload.location !== 'string') return false;
  if (typeof payload.createdByAI !== 'boolean') return false;
  // Optionally check other fields
  return true;
}