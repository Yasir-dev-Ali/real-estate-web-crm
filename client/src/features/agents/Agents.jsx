import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Avatar } from "@/components/ui";

export default function Agents() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await api.get("/users", { params: { limit: 50 } });
    setItems(data.items);
  }
  useEffect(() => {
    load().catch(() => toast.error("Desk failed to load"));
  }, []);

  async function toggle(user) {
    await api.patch(`/users/${user._id}`, { status: user.status === "active" ? "inactive" : "active" });
    toast.success("Status updated");
    load();
  }

  return (
    <Page kicker="People" title="The desk" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Invite agent</button>}>
      {items.length === 0 ? (
        <Card><Empty title="No seats" body="Invite your first consultant." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((u) => (
            <Card key={u._id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar name={u.name} src={u.avatar} />
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-ink-500">{u.title}</p>
                  </div>
                </div>
                <Badge status={u.status}>{u.role}</Badge>
              </div>
              <p className="mt-4 text-sm text-ink-600">{u.email}</p>
              <p className="text-sm text-ink-500">{u.phone} · {u.city}</p>
              <p className="mt-3 text-sm">Split {u.commissionRate}%</p>
              <button className="btn-ghost mt-4 w-full" onClick={() => toggle(u)}>
                {u.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </Card>
          ))}
        </div>
      )}
      {open && <AgentForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </Page>
  );
}

function AgentForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "Karachi", commissionRate: 2.5, title: "Sales Consultant", role: "agent" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name || !form.email || !form.password) return toast.error("Name, email, password required");
    if (
      form.password.length < 10 ||
      form.password.length > 128 ||
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      return toast.error("Use 10+ characters with uppercase, lowercase and a number.");
    }
    setBusy(true);
    try {
      await api.post("/users", form);
      toast.success("Seat created");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create agent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="New seat" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Creating…" : "Create"}</button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Name</label><input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label">Email</label><input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><label className="label">Password</label><input className="field" type="password" autoComplete="new-password" minLength={10} value={form.password} onChange={(e) => set("password", e.target.value)} /><p className="mt-1 text-xs text-ink-500">10+ characters with uppercase, lowercase and a number.</p></div>
        <div><label className="label">Phone</label><input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><label className="label">City</label><input className="field" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
        <div><label className="label">Commission %</label><input className="field" type="number" step="0.1" value={form.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} /></div>
        <div><label className="label">Title</label><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
      </div>
    </Modal>
  );
}
