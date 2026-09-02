import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeFactFind,
  createCase,
  getCase,
  listCases,
  type CaseList,
  type CaseListItem,
} from "../api/origination";
import { caseKeys } from "../api/queryKeys";
import { useAuth } from "../auth/AuthContext";
import type { FactFindPayload } from "../api/factFindSchema";

export function useCaseListQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: caseKeys.list(),
    queryFn: () => listCases(),
    enabled: Boolean(user),
    select: (result) => result.cases,
  });
}

export function useCaseQuery(caseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: caseKeys.detail(caseId ?? ""),
    queryFn: () => getCase(caseId!),
    enabled: Boolean(user && caseId),
  });
}

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryNotes: string) => createCase(inquiryNotes),
    onSuccess: (created, inquiryNotes) => {
      const item: CaseListItem = {
        caseId: created.caseId,
        status: created.status,
        inquiryNotes,
      };
      queryClient.setQueryData<CaseList>(caseKeys.list(), (current) => {
        if (!current) {
          return { cases: [item] };
        }
        return {
          cases: [
            item,
            ...current.cases.filter((row) => row.caseId !== item.caseId),
          ],
        };
      });
      queryClient.setQueryData(caseKeys.detail(created.caseId), {
        ...item,
        factFind: null,
      });
      void queryClient.invalidateQueries({ queryKey: caseKeys.list() });
    },
  });
}

export function useCompleteFactFindMutation(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (factFind: FactFindPayload) =>
      completeFactFind(caseId, factFind),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
      void queryClient.invalidateQueries({ queryKey: caseKeys.list() });
    },
  });
}
