import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Employee, PTORequest, PublicHoliday, EmployeeStats } from "./types";

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<Employee, "id">) => {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });
      if (!res.ok) throw new Error("Failed to add employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Employee) => {
      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePTORequests() {
  return useQuery<PTORequest[]>({
    queryKey: ["pto-requests"],
    queryFn: async () => {
      const res = await fetch("/api/pto-requests");
      if (!res.ok) throw new Error("Failed to fetch PTO requests");
      return res.json();
    },
  });
}

export function useAddPTORequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: Omit<PTORequest, "id" | "createdAt">) => {
      const res = await fetch("/api/pto-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error("Failed to add PTO request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pto-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdatePTORequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: PTORequest) => {
      const res = await fetch("/api/pto-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error("Failed to update PTO request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pto-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeletePTORequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pto-requests?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete PTO request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pto-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useHolidays() {
  return useQuery<PublicHoliday[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      const res = await fetch("/api/holidays");
      if (!res.ok) throw new Error("Failed to fetch holidays");
      return res.json();
    },
  });
}

export function useAddHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (holiday: Omit<PublicHoliday, "id">) => {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holiday),
      });
      if (!res.ok) throw new Error("Failed to add holiday");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/holidays?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete holiday");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useStats() {
  return useQuery<EmployeeStats[]>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}
