"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, Activity, MessageSquare, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { adminApi, type AdminStats, type AdminUser, type TopDtc, type AiUsageEntry } from "@/lib/api/admin-api";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [topDtc, setTopDtc] = useState<TopDtc[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageEntry[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    Promise.all([
      adminApi.getStats(),
      adminApi.getUsers(1),
      adminApi.getTopDtc(),
      adminApi.getAiUsage(),
    ]).then(([s, u, d, a]) => {
      setStats(s);
      setUsers(u.users);
      setTotalPages(u.totalPages);
      setTopDtc(d);
      setAiUsage(a);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSearch = () => {
    adminApi.getUsers(1, search).then((res) => {
      setUsers(res.users);
      setPage(1);
      setTotalPages(res.totalPages);
    });
  };

  const handlePageChange = (p: number) => {
    adminApi.getUsers(p, search || undefined).then((res) => {
      setUsers(res.users);
      setPage(p);
      setTotalPages(res.totalPages);
    });
  };

  const handlePlanChange = (userId: string, plan: string) => {
    adminApi.updateUserPlan(userId, plan).then(() => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
    });
  };

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    adminApi.deleteUser(userId).then(() => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    });
  };

  if (user?.role !== "ADMIN") return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={20} />}
          label="Users"
          value={stats?.users.total || 0}
          sub={`+${stats?.users.thisWeek || 0} this week`}
        />
        <StatCard
          icon={<Car size={20} />}
          label="Vehicles"
          value={stats?.vehicles.total || 0}
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Scans"
          value={stats?.diagnostics.total || 0}
          sub={`${stats?.diagnostics.today || 0} today`}
        />
        <StatCard
          icon={<MessageSquare size={20} />}
          label="AI Messages"
          value={stats?.aiChat.totalMessages || 0}
          sub={`${stats?.aiChat.messagesToday || 0} today`}
        />
      </div>

      {/* Plan distribution */}
      {stats?.users.byPlan && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Plans</h3>
          <div className="flex gap-4">
            {Object.entries(stats.users.byPlan).map(([plan, count]) => (
              <div key={plan} className="text-center">
                <div className="text-lg font-bold text-foreground">{count}</div>
                <div className="text-xs text-muted">{plan}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top DTC Codes */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top DTC Codes</h3>
          {topDtc.length === 0 ? (
            <p className="text-xs text-muted">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topDtc.map((d) => (
                <div key={d.code} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-foreground">{d.code}</span>
                  <span className="text-muted">{d.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top AI Users */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top AI Users</h3>
          {aiUsage.length === 0 ? (
            <p className="text-xs text-muted">No data yet</p>
          ) : (
            <div className="space-y-2">
              {aiUsage.map((u) => (
                <div key={u.email} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate max-w-[200px]">{u.name || u.email}</span>
                  <span className="text-muted">{u.count} msgs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Users</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search email or name..."
              className="rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
            />
            <Button onClick={handleSearch} className="h-8 w-8 p-0">
              <Search size={14} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium">Vehicles</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{u.email}</td>
                  <td className="py-2 text-muted">{u.name || "—"}</td>
                  <td className="py-2">
                    <select
                      value={u.plan}
                      onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO</option>
                      <option value="BUSINESS">BUSINESS</option>
                    </select>
                  </td>
                  <td className="py-2 text-muted">{u._count.vehicles}</td>
                  <td className="py-2 text-muted text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    {u.role !== "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.email)}
                        className="p-1 rounded text-muted hover:text-error hover:bg-error/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="h-7 text-xs px-2"
            >
              Prev
            </Button>
            <span className="text-xs text-muted">{page}/{totalPages}</span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-7 text-xs px-2"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </div>
      {sub && <p className="text-[11px] text-muted mt-2">{sub}</p>}
    </div>
  );
}
