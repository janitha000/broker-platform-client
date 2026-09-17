import { useState, type FormEvent } from "react";
import { ApiError } from "../api/http";
import { DOCUMENT_TYPES, type DocumentType } from "../api/documents";
import {
  useCaseDocumentsQuery,
  useDownloadDocumentMutation,
  useUploadCaseDocumentMutation,
} from "../hooks/useCaseDocuments";
import { formatDateTime } from "../helpers/date";
import { Alert } from "./Alert";
import { Button } from "./Button";
import styles from "./CaseDocumentsPanel.module.css";

const TYPE_LABELS: Record<DocumentType, string> = {
  PhotoId: "Photo ID",
  Payslip: "Payslip",
  BankStatement: "Bank statement",
  RatesNotice: "Rates notice",
  LoanStatement: "Loan statement",
  TaxReturn: "Tax return",
  ContractOfSale: "Contract of sale",
  Other: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  PendingUpload: "Uploading",
  PendingScan: "Scanning",
  Clean: "Available",
  Quarantined: "Quarantined",
  Rejected: "Rejected",
};

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function CaseDocumentsPanel({ caseId }: { caseId: string }) {
  const documentsQuery = useCaseDocumentsQuery(caseId);
  const uploadMutation = useUploadCaseDocumentMutation(caseId);
  const downloadMutation = useDownloadDocumentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] =
    useState<DocumentType>("BankStatement");
  const [validationError, setValidationError] = useState<string | null>(null);

  const documents = documentsQuery.data?.documents ?? [];
  const uploadError = mutationMessage(
    uploadMutation.error,
    "Could not upload the document.",
  );
  const downloadError = mutationMessage(
    downloadMutation.error,
    "Could not download the document.",
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (!selectedFile) {
      setValidationError("Select a document.");
      return;
    }

    if (selectedFile.size > MAX_FILE_BYTES) {
      setValidationError("Documents must be 20 MB or smaller.");
      return;
    }

    const form = event.currentTarget;

    uploadMutation.mutate(
      {
        file: selectedFile,
        type: documentType,
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedFile(null);
          setDocumentType("BankStatement");
        },
      },
    );
  }

  return (
    <section className={styles.section} aria-labelledby="documents-title">
      <div className={styles.heading}>
        <div>
          <h2 id="documents-title">Documents</h2>
          <p>PDF, JPEG or PNG. Maximum file size 20 MB.</p>
        </div>

        {documentsQuery.isFetching && !documentsQuery.isPending ? (
          <span className={styles.refreshing}>Updating…</span>
        ) : null}
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          <span>Document type</span>
          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as DocumentType)
            }
            disabled={uploadMutation.isPending}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>File</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            disabled={uploadMutation.isPending}
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setValidationError(null);
              uploadMutation.reset();
            }}
          />
        </label>

        <Button type="submit" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading…" : "Upload document"}
        </Button>
      </form>

      {validationError ? <Alert>{validationError}</Alert> : null}
      {uploadError ? <Alert>{uploadError}</Alert> : null}
      {downloadError ? <Alert>{downloadError}</Alert> : null}

      {documentsQuery.isPending ? (
        <p>Loading documents…</p>
      ) : documentsQuery.isError ? (
        <Alert>
          {mutationMessage(
            documentsQuery.error,
            "Could not load the documents.",
          )}
        </Alert>
      ) : documents.length === 0 ? (
        <p className={styles.empty}>No documents uploaded.</p>
      ) : (
        <ul className={styles.list}>
          {documents.map((document) => (
            <li className={styles.item} key={document.documentId}>
              <div className={styles.document}>
                <strong>{document.originalFileName}</strong>
                <span>
                  {TYPE_LABELS[document.type]} ·{" "}
                  {formatFileSize(document.sizeBytes)} ·{" "}
                  {formatDateTime(document.createdAt)}
                </span>
              </div>

              <div className={styles.actions}>
                <span className={styles.status} data-status={document.status}>
                  {STATUS_LABELS[document.status] ?? document.status}
                </span>

                {document.canDownload ? (
                  <Button
                    variant="secondary"
                    disabled={downloadMutation.isPending}
                    onClick={() => downloadMutation.mutate(document.documentId)}
                  >
                    Download
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function mutationMessage(error: unknown, fallback: string): string | null {
  if (!error) return null;

  if (error instanceof ApiError) return error.title || fallback;

  if (error instanceof Error) return error.message || fallback;

  return fallback;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
