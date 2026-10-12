import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  CalendarClock,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
  Wallet,
  X,
  ListTodo,
  UserCog,
  Settings,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Avatar } from "../components/ui";

const NAV = [
  { to: "/", label: "Floor", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/properties", label: "Listings", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Handshake },
  { to: "/bookings", label: "Diary", icon: CalendarClock },
  { to: "/follow-ups", label: "Follow-ups", icon: ListTodo },
  { to: "/commissions", label: "Commissions", icon: Wallet },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [notes, setNotes] = useState([]);
  const [unread, setUnread] = useState(0);
  const [bell, setBell] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotes(res.data.items);
      setUnread(res.data.unread);
    });
  }, [location.pathname]);

  function search(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  async function markAll() {
    await api.patch("/notifications/all");
    setUnread(0);
    setNotes((n) => n.map((x) => ({ ...x, read: true })));
  }

  async function openNote(n) {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}`).catch(() => {});
      setNotes((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setBell(false);
    if (n.link) navigate(n.link);
  }

  const links = [
    ...NAV,
    ...(user?.role === "admin" ? [{ to: "/agents", label: "Desk", icon: UserCog }] : []),
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-900 text-paper-100">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brass-400 text-ink-900">
          <Home size={18} />
        </div>
        <div>
          <p className="font-serif text-xl leading-none text-paper-50">Aurelia</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-brass-400">Realty OS</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive ? "bg-white/10 text-paper-50" : "text-ink-300 hover:bg-white/5 hover:text-paper-50"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-ink-800 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} src={user?.avatar} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-paper-50">{user?.name}</p>
            <p className="truncate text-xs capitalize text-ink-300">{user?.role} · {user?.city || "Pakistan"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-xs text-ink-300 hover:text-paper-50"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden md:block">{sidebar}</aside>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="relative h-full w-[260px]"
            >
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-paper-200 bg-paper-50/90 px-4 py-3 backdrop-blur md:px-8">
          <button className="rounded-xl border border-paper-200 p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <form onSubmit={search} className="relative max-w-xl flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a name, phone, DHA, Clifton…"
              className="field pl-9"
            />
          </form>
          <div className="relative">
            <button className="relative rounded-xl border border-paper-200 bg-white p-2" onClick={() => setBell((v) => !v)} aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </button>
            {bell && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
                  <p className="text-sm font-semibold">Inbox</p>
                  <button className="text-xs text-clay-500" onClick={markAll}>
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notes.length === 0 && <p className="p-4 text-sm text-ink-500">Quiet desk.</p>}
                  {notes.map((n) => (
                    <button
                      key={n._id}
                      className={`block w-full px-4 py-3 text-left text-sm hover:bg-paper-50 ${n.read ? "opacity-60" : ""}`}
                      onClick={() => openNote(n)}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-ink-500">{n.body}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
