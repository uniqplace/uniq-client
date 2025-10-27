import type { ProductParam } from "../features/product Idea & AI/slices/aiProductTypes";

export function validateProductParams(params: ProductParam[]): { error?: string; paramId?: string } | null {
  for (const param of params) {
    if (param.requiredByAI && (param.value === undefined || param.value === null || param.value === "")) {
      return {
        error: `The parameter "${param.label}" is required and was not provided.`,
        paramId: param.id,
      };
    }
    if (param.type === "number" && param.value !== undefined && param.value !== null && param.value !== "") {
      if (isNaN(Number(param.value))) {
        return {
          error: `The parameter "${param.label}" must be a valid number.`,
          paramId: param.id,
        };
      }
    }
    if (param.type === "boolean" && param.value !== undefined && param.value !== null && param.value !== "") {
      if (typeof param.value !== 'boolean' && !['true', 'false'].includes(String(param.value))) {
        return {
          error: `The parameter "${param.label}" must be a boolean value (true/false).`,
          paramId: param.id,
        };
      }
    }
    if (param.type === "enum" && param.value !== undefined && param.value !== null && param.value !== "") {
      if (!param.enumOptions || !param.enumOptions.includes(param.value)) {
        return {
          error: `The parameter "${param.label}" must be one of: ${param.enumOptions?.join(", ")}.`,
          paramId: param.id,
        };
      }
    }
    if (param.type === "date" && param.value !== undefined && param.value !== null && param.value !== "") {
      if (isNaN(Date.parse(param.value))) {
        return {
          error: `The parameter "${param.label}" must be a valid date.`,
          paramId: param.id,
        };
      }
    }
    // file/text: add more validations as needed
  }
  return null;
}
