import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateSha256,
  completeDocumentUpload,
  createDocumentUpload,
  listDocuments,
  requestDocumentDownload,
  resolveContentType,
  uploadToS3,
  type DocumentType,
} from "../api/documents";
import { documentKeys } from "../api/queryKeys";
import { useAuth } from "../auth/useAuth";

type UploadArguments = {
  file: File;
  type: DocumentType;
};

export function useCaseDocumentsQuery(caseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: documentKeys.byCase(caseId ?? ""),
    queryFn: () => listDocuments(caseId!),
    enabled: Boolean(user && caseId),
    refetchInterval: (query) => {
      const hasPendingScan = query.state.data?.documents.some(
        (document) =>
          document.status === "PendingUpload" ||
          document.status === "PendingScan",
      );

      return hasPendingScan ? 2_000 : false;
    },
  });
}

export function useUploadCaseDocumentMutation(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type }: UploadArguments) => {
      const contentType = resolveContentType(file);
      if (!contentType) {
        throw new Error("Upload a PDF, JPEG, or PNG.");
      }

      const sha256 = await calculateSha256(file);

      const session = await createDocumentUpload({
        caseId,
        type,
        fileName: file.name,
        contentType,
        sizeBytes: file.size,
        sha256,
        idempotencyKey: crypto.randomUUID(),
      });

      if (!session.uploadUrl) {
        throw new Error("The upload session did not return an S3 URL.");
      }

      await uploadToS3(session.uploadUrl, file, contentType);
      return completeDocumentUpload(session.documentId);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: documentKeys.byCase(caseId),
      });
    },
  });
}

export function useDownloadDocumentMutation() {
  return useMutation({
    mutationFn: requestDocumentDownload,
    onSuccess: ({ downloadUrl }) => {
      const opened = window.open(downloadUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(downloadUrl);
      }
    },
  });
}
