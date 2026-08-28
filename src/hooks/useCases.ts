import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeFactFind, createCase, getCase, listCases } from "../api/origination";
import { caseKeys } from "../api/queryKeys";
import { useAuth } from "../auth/AuthContext";

export function useCaseListQuery() {
  const { user } = useAuth();
  const token = user?.accessToken;

  return useQuery({
    queryKey: caseKeys.list(),
    queryFn: () => listCases(token!),
    enabled: Boolean(token),
    select: (result) => result.cases,
  });
}

export function useCaseQuery(caseId: string | undefined) {
  const { user } = useAuth();
  const token = user?.accessToken;

  return useQuery({
    queryKey: caseKeys.detail(caseId ?? ""),
    queryFn: () => getCase(token!, caseId!),
    enabled: Boolean(token && caseId),
  });
}

export function useCreateCaseMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryNotes: string) => createCase(user!.accessToken, inquiryNotes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: caseKeys.list() });
    },
  });
}

export function useCompleteFactFindMutation(caseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (factFind: {
      objectives: string;
      income: number;
      expenses: number;
      assets: number;
      debts: number;
    }) => completeFactFind(user!.accessToken, caseId, factFind),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
      void queryClient.invalidateQueries({ queryKey: caseKeys.list() });
    },
  });
}
