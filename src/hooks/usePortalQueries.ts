"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { higherStudyService } from "@/services/higherStudyService";
import { paymentService } from "@/services/paymentService";
import { commissionService } from "@/services/commissionService";
import { userService } from "@/services/userService";

export function useUniversitiesQuery() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const res = await higherStudyService.getUniversities();
      return res.data || [];
    },
  });
}

export function useCountriesQuery() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await higherStudyService.getCountries();
      return res.data || [];
    },
  });
}

export function useMyApplicationsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const res = await higherStudyService.getMyApplications();
      return res.data || [];
    },
    enabled,
  });
}

export function useAllApplicationsQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-applications"],
    queryFn: async () => {
      const res = await higherStudyService.getAllApplications();
      return res.data || [];
    },
    enabled,
  });
}

export function useMyPaymentsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await paymentService.getMyPayments();
      return res.data || [];
    },
    enabled,
  });
}

export function useMyCommissionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-commissions"],
    queryFn: async () => {
      const res = await commissionService.getMyCommissions();
      return res.data || [];
    },
    enabled,
  });
}

export function useAllCommissionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-commissions"],
    queryFn: async () => {
      const res = await commissionService.getAllCommissions();
      return res.data || [];
    },
    enabled,
  });
}

export function useAllUsersQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await userService.getAllUsers();
      return res.data || [];
    },
    enabled,
  });
}

export function useUpdateApplicationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: string;
    }) => {
      return higherStudyService.updateStage(applicationId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}
