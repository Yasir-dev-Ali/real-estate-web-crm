import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Pagination } from "@/components/ui";
import { when } from "@/lib/format";

export default function FollowUps() {
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState([]);

  async function load() {
    const { data: res } = await api.get("/follow-ups", { params: { status, page } });
    setData(res);
  }
  useEffect(() => {
    load().catch(() => toast.error("Could not load follow-ups"));
  }, [status, page]);

  useEffect(() => {
    api.get("/leads", { params: { limit: 50 } }).then((r) => setLeads(r.data.items));
  }, []);

  async function mark(item, next) {
    await api.patch(`/follow-ups/${item._id}`, { status: next });
    toast.success("Updated");
    load();
  }

  return (
    <Page kicker="Cadence" title="Follow-ups" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add reminder</button>}>
      <div className="flex gap-2">
        {["open", "done", "missed", ""].map((s) => (
          <button key={s || "all"} className={`rounded-full px-3 py-1 text-xs capitalize ${status === s ? "bg-ink-900 text-white" : "border border-paper-200 bg-white"}`} onClick={() => { setStatus(s); setPage(1); }}>
            {s || "all"}
          </button>
        ))}
      </div>
      <Card>
        {data.items?.length === 0 ? (
          <Empty title="Caught up" body="No reminders in this tray." />
        ) : (
          <ul className="divide-y divide-paper-200">
            {data.items.map((f) => (
              <li key={f._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-xs text-ink-500">{when(f.dueAt)} · {f.channel} · {f.assignedTo?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={f.status}>{f.status}</Badge>
                  {f.status !== "done" && (
                    <button className="btn-ghost py-1.5 text-xs" onClick={() => mark(f, "done")}>Done</button>
                  )}
                  {f.status === "open" && new Date(f.dueAt) < new Date() && (
                    <button className="btn-ghost py-1.5 text-xs" onClick={() => mark(f, "missed")}>Missed</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={data.page} pages={data.pages} onPage={setPage} />
      </Card>
      {open && (
        <FollowForm
          leads={leads}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); load(); }}
        />
      )}
    </Page>
  );
}

function FollowForm({ leads, onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", relatedId: "", relatedType: "lead", dueAt: "", channel: "call", notes: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title || !form.relatedId || !form.dueAt) return toast.error("Title, record and due date required");
    await api.post("/follow-ups", form);
    toast.success("Reminder set");
    onSaved();
  }

  return (
    <Modal title="Reminder" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
      <div className="grid gap-3">
        <div><label className="label">Title</label><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div>
          <label className="label">Lead</label>
          <select className="field" value={form.relatedId} onChange={(e) => set("relatedId", e.target.value)}>
            <option value="">Select</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Channel</label>
          <select className="field" value={form.channel} onChange={(e) => set("channel", e.target.value)}>
            <option>call</option><option>whatsapp</option><option>email</option><option>meeting</option>
          </select>
        </div>
        <div><label className="label">Due</label><input className="field" type="datetime-local" value={form.dueAt} onChange={(e) => set("dueAt", e.target.value)} /></div>
        <div><label className="label">Notes</label><textarea className="field" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      </div>
    </Modal>
  );
}
