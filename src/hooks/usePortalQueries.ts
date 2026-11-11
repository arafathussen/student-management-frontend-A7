"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { higherStudyService } from "@/services/higherStudyService";
import { paymentService } from "@/services/paymentService";
import { commissionService } from "@/services/commissionService";
import { userService } from "@/services/userService";

function extractArray(res: any, key?: string): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (key && Array.isArray(res?.[key])) return res[key];
  if (key && Array.isArray(res?.data?.[key])) return res.data[key];
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export function useUniversitiesQuery() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const res = await higherStudyService.getUniversities({ limit: 100 });
      return extractArray(res, "universities");
    },
  });
}

export function useCountriesQuery() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await higherStudyService.getCountries();
      return extractArray(res, "countries");
    },
  });
}

export function useMyApplicationsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const res = await higherStudyService.getMyApplications();
      return extractArray(res, "applications");
    },
    enabled,
  });
}

export function useAllApplicationsQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-applications"],
    queryFn: async () => {
      const res = await higherStudyService.getAllApplications({ limit: 100 });
      return extractArray(res, "applications");
    },
    enabled,
  });
}

export function useMyPaymentsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await paymentService.getMyPayments();
      return extractArray(res, "payments");
    },
    enabled,
  });
}

export function useMyCommissionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-commissions"],
    queryFn: async () => {
      const res = await commissionService.getMyCommissions();
      return extractArray(res, "commissions");
    },
    enabled,
  });
}

export function useAllCommissionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-commissions"],
    queryFn: async () => {
      const res = await commissionService.getAllCommissions();
      return extractArray(res, "commissions");
    },
    enabled,
  });
}

export function useAllUsersQuery(enabled = true) {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await userService.getAllUsers({ limit: 100 });
      return extractArray(res, "users");
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
