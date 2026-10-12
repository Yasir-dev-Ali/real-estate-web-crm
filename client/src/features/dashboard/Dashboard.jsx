import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/api/client";
import { Page, Card, Skeleton, Badge, ErrorState } from "@/components/ui";
import { money, when } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#12242B", "#B85C38", "#3F6F5B", "#C4A574", "#5C7A84", "#9A4A2C"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics/dashboard")
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load floor"));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const k = data.kpis;
  const pending = k.commissions.find((c) => c._id === "pending")?.total || 0;
  const monthly = data.monthly.map((m) => ({
    name: MONTHS[(m._id.m || 1) - 1],
    value: m.value,
  }));
  const sources = data.leadsBySource.map((s) => ({ name: s._id, count: s.count }));

  return (
    <Page
      kicker={user?.role === "admin" ? "House view" : "Your book"}
      title={`Good ${hourWord()}, ${user?.name?.split(" ")[0]}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active pipeline" value={money(k.pipeline)} hint={`${k.openDeals} open deals`} />
        <Kpi label="Closed this month" value={money(k.closedValue)} hint={`${k.closedCount} keys handed`} />
        <Kpi label="Live listings" value={k.listings} hint="Available + reserved" />
        <Kpi label="Leads on desk" value={k.leads} hint={`Pending commission ${money(pending)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Deal volume</h2>
            <span className="text-xs text-ink-500">Last six months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly.length ? monthly : [{ name: "—", value: 0 }]}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B85C38" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#B85C38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8DFD0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#A8BDC4" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1e6)}m`} tick={{ fontSize: 12 }} stroke="#A8BDC4" />
                <Tooltip formatter={(v) => money(v)} />
                <Area type="monotone" dataKey="value" stroke="#B85C38" fill="url(#v)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-serif text-2xl">Lead sources</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {sources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {data.dealsByStage?.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-serif text-2xl">Pipeline by stage</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.dealsByStage
              .filter((s) => s._id !== "lost")
              .map((s) => (
                <Link key={s._id} to={`/deals?stage=${s._id}`} className="rounded-xl border border-paper-200 p-3 hover:border-ink-300">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">{s._id}</p>
                  <p className="mt-1 font-serif text-2xl">{s.count}</p>
                  <p className="text-xs text-ink-500">{money(s.value)}</p>
                </Link>
              ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
            <h2 className="font-serif text-xl">Due this week</h2>
            <Link to="/follow-ups" className="text-xs font-semibold text-clay-500">
              All follow-ups
            </Link>
          </div>
          <ul className="divide-y divide-paper-200">
            {data.upcomingFollowUps.length === 0 && (
              <li className="px-5 py-8 text-sm text-ink-500">Nothing ringing. Enjoy the quiet.</li>
            )}
            {data.upcomingFollowUps.map((f) => (
              <li key={f._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-ink-500">{when(f.dueAt)}</p>
                </div>
                <Badge status={f.status}>{f.channel}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
            <h2 className="font-serif text-xl">Diary — 7 days</h2>
            <Link to="/bookings" className="text-xs font-semibold text-clay-500">
              Open diary
            </Link>
          </div>
          <ul className="divide-y divide-paper-200">
            {data.bookingsWeek.length === 0 && (
              <li className="px-5 py-8 text-sm text-ink-500">No viewings on the book.</li>
            )}
            {data.bookingsWeek.map((b) => (
              <li key={b._id} className="px-5 py-3">
                <p className="text-sm font-medium">{b.property?.title}</p>
                <p className="text-xs text-ink-500">
                  {b.lead?.name} · {when(b.scheduledAt)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Page>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">{label}</p>
      <p className="mt-3 font-serif text-3xl text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{hint}</p>
    </Card>
  );
}

function hourWord() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
