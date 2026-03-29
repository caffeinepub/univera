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
import { useState } from "react";
import { ADMIN_REPORTS, ADMIN_USERS } from "../data/mockData";

type Tab = "overview" | "users" | "reports";

export function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [reports, setReports] = useState(ADMIN_REPORTS);

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
      <div className="px-4 py-2 flex gap-2 glass-dark border-b border-border/50 flex-shrink-0">
        {(["overview", "users", "reports"] as Tab[]).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`admin.${t}.tab`}
          >
            {t}
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
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass-card rounded-2xl p-4">
                  <Icon size={22} style={{ color }} className="mb-2" />
                  <div className="font-display text-xl font-black text-foreground">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Quick Stats
              </h3>
              {[
                { label: "Matches Today", value: "89" },
                { label: "Messages Sent", value: "2,341" },
                { label: "New Signups", value: "23" },
                { label: "Pro Subscribers", value: "156" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-bold text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3" data-ocid="admin.table">
            {users.map((u, i) => (
              <div
                key={u.id}
                className="glass-card rounded-2xl p-4"
                data-ocid={`admin.row.${i + 1}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-foreground text-sm">
                      {u.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </div>
                  {u.blocked && (
                    <span className="text-xs text-destructive font-semibold">
                      Blocked
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleVerified(u.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      u.verified
                        ? "bg-green-500/20 text-green-400"
                        : "bg-border text-muted-foreground"
                    }`}
                    data-ocid={`admin.row.${i + 1}`}
                  >
                    {u.verified ? "✓ Verified" : "Unverified"}
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePro(u.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      u.pro
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-border text-muted-foreground"
                    }`}
                    data-ocid={`admin.row.${i + 1}`}
                  >
                    {u.pro ? "⚡ Pro" : "Free"}
                  </button>
                  <button
                    type="button"
                    onClick={() => blockUser(u.id)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all flex items-center gap-1"
                    data-ocid={`admin.row.${i + 1}`}
                  >
                    <Ban size={10} /> {u.blocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3" data-ocid="admin.list">
            {reports.map((r, i) => (
              <div
                key={r.id}
                className="glass-card rounded-2xl p-4"
                data-ocid={`admin.item.${i + 1}`}
              >
                <div className="flex justify-between mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      r.status === "resolved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-sm text-foreground mb-1">
                  <span className="text-muted-foreground">{r.reporter}</span> →{" "}
                  <span className="font-semibold">{r.reported}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{r.reason}</p>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                      data-ocid={`admin.item.${i + 1}`}
                    >
                      Warn User
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      data-ocid={`admin.item.${i + 1}`}
                    >
                      Ban User
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
