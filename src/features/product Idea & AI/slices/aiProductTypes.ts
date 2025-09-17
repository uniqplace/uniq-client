// Product types for AI Product Slice

export type ParamStatus = "confirmed" | "missing" | "skipped";
export type ParamSource = "ai" | "user";
export type ParamType = "text" | "number" | "boolean" | "color" | "enum" | "file" | "date";

export interface ProductParam {
  id: string;
  label: string;
  type: ParamType;
  requiredByAI: boolean;
  status: ParamStatus;
  value?: any;
  unit?: string;
  enumOptions?: string[];
  source: ParamSource;
  skipConfirmation?: {
    confirmed: true;
    confirmedAt: string;
    reason?: string;
  };
  notes?: string;
  validation?: { valid: boolean; issues?: string[] };
}

export interface ProductSummary {
  requiredTotal: number;
  requiredConfirmed: number;
  requiredSkippedApproved: number;
  requiredMissing: number;
  optionalProvided: number;
  addedByUser: number;
  completenessScore: number;
  blocking: boolean;
}

export interface AuditEntry {
  at: string;
  actor: "user" | "system" | "ai";
  action: string;
  details?: any;
}

export interface ProductPayload {
  sessionId: string;
  productName?: string;
  category?: { id: string; name: string; confidence: number };
  aiVersion?: string;
  params: ProductParam[];
  summary?: ProductSummary;
  audit: AuditEntry[];
  locale?: { currency?: string; units?: "metric" | "imperial"; language?: string };
  status: "idle" | "drafting" | "refining" | "validating" | "locked" | "error";
  error?: string;
}
