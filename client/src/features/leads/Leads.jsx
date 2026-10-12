import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Pagination, TableWrap, Th, Td, Skeleton } from "@/components/ui";
import { money, day } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["new", "contacted", "qualified", "viewing", "negotiation", "won", "lost"];
const SOURCES = ["website", "referral", "walk-in", "whatsapp", "zameen", "olx", "campaign"];

export default function Leads() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const q = params.get("q") || "";
  const status = params.get("status") || "";
  const source = params.get("source") || "";
  const page = Number(params.get("page") || 1);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  async function load() {
    setLoading(true);
    const { data: res } = await api.get("/leads", { params: { q, status, source, page, limit: 10 } });
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => toast.error("Could not load leads"));
  }, [q, status, source, page]);

  useEffect(() => {
    api.get("/agents", { params: { role: "agent", limit: 50 } }).then((r) => setAgents(r.data.items || [])).catch(() => {});
  }, []);

  return (
    <Page
      kicker="Pipeline"
      title="Leads"
      actions={<button className="btn-primary" onClick={() => setOpen(true)}>New enquiry</button>}
    >
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="field" placeholder="Search name, phone, area" defaultValue={q} onKeyDown={(e) => e.key === "Enter" && setFilter("q", e.target.value)} />
          <select className="field" value={status} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">All stages</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="field" value={source} onChange={(e) => setFilter("source", e.target.value)}>
            <option value="">All sources</option>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <p className="self-center text-sm text-ink-500">{data.total} on the book</p>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : data.items.length === 0 ? (
          <Empty title="No enquiries match" body="Widen the filters or log a walk-in." action={<button className="btn-primary" onClick={() => setOpen(true)}>Log lead</button>} />
        ) : (
          <>
            <TableWrap>
              <table className="min-w-full">
                <thead className="border-b border-paper-200 bg-paper-50">
                  <tr>
                    <Th>Name</Th>
                    <Th>City</Th>
                    <Th>Budget</Th>
                    <Th>Source</Th>
                    <Th>Stage</Th>
                    <Th>Follow-up</Th>
                    {user.role === "admin" && <Th>Agent</Th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {data.items.map((lead) => (
                    <tr key={lead._id} className="hover:bg-paper-50">
                      <Td>
                        <Link to={`/leads/${lead._id}`} className="font-semibold hover:text-clay-500">
                          {lead.name}
                        </Link>
                        <p className="text-xs text-ink-500">{lead.phone}</p>
                      </Td>
                      <Td>
                        {lead.city}
                        <p className="text-xs text-ink-500">{lead.area}</p>
                      </Td>
                      <Td>{money(lead.budgetMax)}</Td>
                      <Td className="capitalize">{lead.source}</Td>
                      <Td><Badge status={lead.status}>{lead.status}</Badge></Td>
                      <Td>{day(lead.nextFollowUp)}</Td>
                      {user.role === "admin" && <Td>{lead.assignedTo?.name}</Td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            <Pagination page={data.page} pages={data.pages} onPage={(p) => setFilter("page", String(p))} />
          </>
        )}
      </Card>

      {open && (
        <LeadForm
          agents={agents}
          isAdmin={user.role === "admin"}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </Page>
  );
}

export function LeadForm({ agents, isAdmin, onClose, onSaved, initial }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "whatsapp",
    interest: "buy",
    city: "Karachi",
    area: "",
    budgetMax: "",
    nextFollowUp: "",
    assignedTo: "",
    notes: "",
    ...initial,
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name and phone are required");
    setBusy(true);
    try {
      const payload = { ...form, budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined };
      if (initial?._id) await api.patch(`/leads/${initial._id}`, payload);
      else await api.post("/leads", payload);
      toast.success("Lead saved");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={initial ? "Edit lead" : "New enquiry"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        </>
      }
    >
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="field" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Source</label>
          <select className="field" value={form.source} onChange={(e) => set("source", e.target.value)}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Interest</label>
          <select className="field" value={form.interest} onChange={(e) => set("interest", e.target.value)}>
            <option>buy</option><option>rent</option><option>invest</option>
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <input className="field" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label">Area</label>
          <input className="field" value={form.area} onChange={(e) => set("area", e.target.value)} />
        </div>
        <div>
          <label className="label">Budget (max PKR)</label>
          <input className="field" type="number" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
        </div>
        <div>
          <label className="label">Next follow-up</label>
          <input className="field" type="datetime-local" value={form.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} />
        </div>
        {isAdmin && (
          <div className="sm:col-span-2">
            <label className="label">Assign</label>
            <select className="field" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
              <option value="">Me / unassigned</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea className="field min-h-20" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
