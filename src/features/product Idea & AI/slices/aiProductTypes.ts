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
  title: string;
  description: string;
  price: number;
  images: string[];
  creator?: any;
  category?: any;
  subCategories: any[];
  status: "idle" | "draft" | "drafting" | "refining" | "validating" | "locked" | "error" | "published" | "hidden";
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  location: string;
  tags: string[];
  params: ProductParam[];
  summary?: ProductSummary;
  audit: AuditEntry[];
  embedding: number[]; 
  locale?: { currency?: string; units?: "metric" | "imperial"; language?: string };
  error?: string;
  aiVersion?: string;
  createdByAI?: boolean;
}