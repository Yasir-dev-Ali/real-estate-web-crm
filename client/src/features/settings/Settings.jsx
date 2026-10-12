import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    title: user?.title || "",
    password: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (
      payload.password &&
      (payload.password.length < 10 ||
        payload.password.length > 128 ||
        !/[a-z]/.test(payload.password) ||
        !/[A-Z]/.test(payload.password) ||
        !/[0-9]/.test(payload.password))
    ) {
      toast.error("Use 10+ characters with uppercase, lowercase and a number.");
      return;
    }
    try {
      const { data } = await api.patch("/auth/me", payload);
      setUser(data.user);
      set("password", "");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save your profile.");
    }
  }

  return (
    <Page kicker="Account" title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-serif text-2xl">Your card</h2>
          <form onSubmit={save} className="mt-4 grid gap-3">
            <div><label className="label">Name</label><input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label className="label">Phone</label><input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className="label">City</label><input className="field" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div><label className="label">Title</label><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><label className="label">New password</label><input className="field" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to keep" /><p className="mt-1 text-xs text-ink-500">10+ characters with uppercase, lowercase and a number.</p></div>
            <button className="btn-primary mt-2 w-fit">Save</button>
          </form>
        </Card>
        <Card className="p-5">
          <h2 className="font-serif text-2xl">Tenant</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            <span className="font-semibold">{user?.workspaceName || "Your brokerage"}</span> has a private workspace.
            Your brokerage keeps its own ledger, agents, and inventory.
          </p>
          <p className="mt-4 text-sm">Role: <span className="capitalize">{user?.role}</span></p>
          <p className="text-sm">Default split: {user?.commissionRate}%</p>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-ink-300">Currency default PKR · JWT sessions · role ACL</p>
        </Card>
      </div>
    </Page>
  );
}
