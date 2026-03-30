import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Ban,
  ChevronLeft,
  DollarSign,
  Flag,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_REPORTS, ADMIN_USERS } from "../data/mockData";
import { useActor } from "../hooks/useActor";

type Tab = "overview" | "users" | "reports" | "backend-reports";

export function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [reports, setReports] = useState(ADMIN_REPORTS);
  const { actor } = useActor();

  // Backend reports
  const [backendReports, setBackendReports] = useState<
    Array<{
      reportId: string;
      reason: string;
      details: string;
      reportedAt: string;
      isReviewed: boolean;
    }>
  >([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    if (tab !== "backend-reports" || !actor) return;
    setReportsLoading(true);
    actor
      .getReports()
      .then((raw) => {
        setBackendReports(
          raw.map((r) => ({
            reportId: r.reportId,
            reason: r.reason,
            details: r.details,
            reportedAt: new Date(
              Number(r.reportedAt / 1_000_000n),
            ).toLocaleString(),
            isReviewed: r.isReviewed,
          })),
        );
      })
      .catch(console.error)
      .finally(() => setReportsLoading(false));
  }, [tab, actor]);

  const markReviewed = async (reportId: string) => {
    if (!actor) return;
    await actor.markReportReviewed(reportId);
    setBackendReports((prev) =>
      prev.map((r) =>
        r.reportId === reportId ? { ...r, isReviewed: true } : r,
      ),
    );
  };

  const toggleVerified = (id: string) =>
    setUsers((p) =>
      p.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)),
    );
  const togglePro = (id: string) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, pro: !u.pro } : u)));
  const blockUser = (id: string) =>
    setUsers((p) =>
      p.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)),
    );
  const resolveReport = (id: string) =>
    setReports((p) =>
      p.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)),
    );

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
    { key: "backend-reports", label: "Live Reports" },
  ];

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      <header className="glass-dark px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="admin.cancel_button"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-display text-xl font-black text-gradient-violet flex-1">
          Admin Dashboard
        </h1>
        <Shield size={20} className="text-primary" />
      </header>

      {/* Tabs */}
      <div className="px-4 py-2 flex gap-2 glass-dark border-b border-border/50 flex-shrink-0 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`admin.${t.key}.tab`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === "overview" && (
          <div className="space-y-4" data-ocid="admin.panel">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Users,
                  label: "Total Users",
                  value: "1,248",
                  color: "#7C3AED",
                },
                {
                  icon: TrendingUp,
                  label: "Active Today",
                  value: "342",
                  color: "#22C55E",
                },
                {
                  icon: Flag,
                  label: "Pending Reports",
                  value: "7",
                  color: "#EF4444",
                },
                {
                  icon: DollarSign,
                  label: "Revenue",
                  value: "₹24,800",
                  color: "#F59E0B",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-4">
                  <stat.icon size={20} style={{ color: stat.color }} />
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`glass-card rounded-2xl p-4 ${
                  u.blocked ? "opacity-50" : ""
                }`}
                data-ocid={`admin.users.item.${i + 1}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {u.name}
                      </span>
                      {u.verified && (
                        <span className="text-[10px] text-blue-400">
                          ✓ Verified
                        </span>
                      )}
                      {u.pro && (
                        <span className="text-[10px] text-yellow-400">
                          ⭐ Pro
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleVerified(u.id)}
                    className="text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-colors"
                    style={{
                      background: u.verified
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "#60a5fa",
                    }}
                    data-ocid={`admin.users.verify.${i + 1}`}
                  >
                    {u.verified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePro(u.id)}
                    className="text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                    style={{
                      background: "rgba(251,191,36,0.12)",
                      border: "1px solid rgba(251,191,36,0.3)",
                      color: "#fbbf24",
                    }}
                    data-ocid={`admin.users.pro.${i + 1}`}
                  >
                    {u.pro ? "Remove Pro" : "Make Pro"}
                  </button>
                  <button
                    type="button"
                    onClick={() => blockUser(u.id)}
                    className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                    }}
                    data-ocid={`admin.users.block.${i + 1}`}
                  >
                    <Ban size={10} /> {u.blocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.map((r, i) => (
              <div
                key={r.id}
                className="glass-card rounded-2xl p-4"
                data-ocid={`admin.reports.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {r.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.reported} · {r.reporter}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      r.status === "resolved"
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {r.status === "resolved" ? "Resolved" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{r.reason}</p>
                <div className="flex gap-2">
                  {r.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id)}
                      className="text-[11px] px-3 py-1.5 rounded-lg font-semibold text-green-400"
                      style={{
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.3)",
                      }}
                      data-ocid={`admin.reports.resolve.${i + 1}`}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {r.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id)}
                      className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg font-semibold text-red-400"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                      data-ocid={`admin.reports.ban.${i + 1}`}
                    >
                      <Ban size={10} /> Ban User
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "backend-reports" && (
          <div className="space-y-3">
            {!actor ? (
              <div
                className="text-center py-16"
                data-ocid="admin.reports.empty_state"
              >
                <div className="text-4xl mb-3">🔌</div>
                <p className="text-muted-foreground font-semibold">
                  Connect to view reports
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Internet Identity connection required
                </p>
              </div>
            ) : reportsLoading ? (
              <div
                className="text-center py-16"
                data-ocid="admin.reports.loading_state"
              >
                <div className="animate-spin text-4xl mb-3">⏳</div>
                <p className="text-muted-foreground text-sm">
                  Loading reports...
                </p>
              </div>
            ) : backendReports.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="admin.reports.empty_state"
              >
                <div className="text-4xl mb-3">✅</div>
                <p className="text-muted-foreground">No reports filed yet.</p>
              </div>
            ) : (
              backendReports.map((r, i) => (
                <div
                  key={r.reportId}
                  className="glass-card rounded-2xl p-4"
                  data-ocid={`admin.live_reports.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {r.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.reportedAt}
                      </p>
                    </div>
                    <Badge
                      className={
                        r.isReviewed
                          ? "bg-green-500/20 text-green-400 border-0"
                          : "bg-yellow-500/20 text-yellow-400 border-0"
                      }
                    >
                      {r.isReviewed ? "Reviewed" : "Pending"}
                    </Badge>
                  </div>
                  {r.details && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {r.details}
                    </p>
                  )}
                  {!r.isReviewed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReviewed(r.reportId)}
                      className="text-xs rounded-xl border-green-500/30 text-green-400 hover:bg-green-500/10"
                      data-ocid={`admin.live_reports.resolve.${i + 1}`}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
