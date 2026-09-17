import { request } from "./http";

const documentUrl = import.meta.env.VITE_DOCUMENT_API_URL ?? "";

export const DOCUMENT_TYPES = [
  "PhotoId",
  "Payslip",
  "BankStatement",
  "RatesNotice",
  "LoanStatement",
  "TaxReturn",
  "ContractOfSale",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type DocumentStatus =
  | "PendingUpload"
  | "PendingScan"
  | "Clean"
  | "Quarantined"
  | "Rejected";

export type DocumentSensitivity = "Standard" | "Sensitive";

export type CaseDocumentItem = {
  documentId: string;
  type: DocumentType;
  status: DocumentStatus;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  sensitivity: DocumentSensitivity;
  canDownload: boolean;
  createdAt: string;
};

type CreateDocumentUploadRequest = {
  caseId: string;
  type: DocumentType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  idempotencyKey: string;
};

type CreateDocumentUploadResult = {
  documentId: string;
  status: DocumentStatus;
  uploadUrl: string;
  token: string;
  method: "PUT";
};

type ListDocumentsResult = {
  documents: CaseDocumentItem[];
};

type DownloadGrant = {
  downloadUrl: string;
  token: string;
};

export function createDocumentUpload(
  body: CreateDocumentUploadRequest,
): Promise<CreateDocumentUploadResult> {
  return request<CreateDocumentUploadResult>(documentUrl, "/documents", {
    method: "POST",
    body,
  });
}

export function completeDocumentUpload(
  documentId: string,
): Promise<CaseDocumentItem> {
  return request<CaseDocumentItem>(
    documentUrl,
    `/documents/${documentId}/complete`,
    { method: "POST" },
  );
}

export function listDocuments(caseId: string): Promise<ListDocumentsResult> {
  const query = new URLSearchParams({ caseId });

  return request<ListDocumentsResult>(
    documentUrl,
    `/documents?${query.toString()}`,
    { method: "GET" },
  );
}

export function requestDocumentDownload(
  documentId: string,
): Promise<DownloadGrant> {
  return request<DownloadGrant>(
    documentUrl,
    `/documents/${documentId}/download`,
    { method: "GET" },
  );
}

const CONTENT_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export function resolveContentType(file: File): string | null {
  if (file.type && Object.values(CONTENT_TYPES_BY_EXTENSION).includes(file.type)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES_BY_EXTENSION[extension] ?? null;
}

export async function calculateSha256(file: File): Promise<string> {
  const content = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", content);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}.`);
  }
}
