"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAllUsersQuery, useUniversitiesQuery } from "@/hooks/usePortalQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { userService } from "@/services/userService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Users,
  Building2,
  Search,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

function AdminManageResourcesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "ALL"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useAllUsersQuery(isAuthenticated);
  const { data: universities = [] } = useUniversitiesQuery();

  useEffect(() => {
    document.title = "Resource Management | Rise Abroad Admin";
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, roleFilter, pathname, router]);

  const filteredUsers = (users as any[]).filter((u) => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (targetUser: any) => {
    const nextStatus = targetUser.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    try {
      setUpdatingId(targetUser.id);
      await userService.updateStatus(targetUser.id, nextStatus);
      toast.success(
        `Updated ${targetUser.name} status to ${nextStatus}`
      );
      await refetchUsers();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update user status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Governance &amp; Resource Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            User &amp; Partner Resource Management
          </h1>
          <p className="text-xs text-slate-400">
            Search, filter, and manage user accounts, roles, and partner institutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/reports">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <span>View Audit &amp; Reports</span>
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="primary" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Command Center</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Registered Accounts</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">
                {users.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400/70" />
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Partner Universities</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {universities.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-emerald-400/70" />
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Active Counselors</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                {(users as any[]).filter((u) => u.role === "COUNSELOR").length}
              </p>
            </div>
            <ShieldCheck className="w-8 h-8 text-amber-400/70" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="COUNSELOR">Counselor</option>
            <option value="STUDENT">Student</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUsers()}
            className="cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-800 bg-slate-900/70 overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-white">
            Directory Accounts ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {usersLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 w-full rounded-xl bg-slate-800/70" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No matching user accounts found for the selected filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Name &amp; Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" className="text-[10px]">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={u.status === "BLOCKED" ? "danger" : "success"}
                        className="text-[10px]"
                      >
                        {u.status || "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== user?.id && u.role !== "SUPER_ADMIN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === u.id}
                          onClick={() => handleToggleStatus(u)}
                          className="cursor-pointer text-[11px] h-7 px-2.5"
                        >
                          {u.status === "BLOCKED" ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              <span>Activate</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1 text-rose-400" />
                              <span>Suspend</span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 max-w-7xl mx-auto animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-slate-800 mb-6" />
          <div className="h-64 w-full rounded-2xl bg-slate-900" />
        </div>
      }
    >
      <AdminManageResourcesContent />
    </Suspense>
  );
}
