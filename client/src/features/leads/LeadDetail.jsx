import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Confirm, Modal } from "@/components/ui";
import { money, when, day } from "@/lib/format";
import { LeadForm } from "@/features/leads/Leads";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["new", "contacted", "qualified", "viewing", "negotiation", "won", "lost"];

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [agents, setAgents] = useState([]);
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(false);
  const [kill, setKill] = useState(false);
  const [remind, setRemind] = useState(false);

  async function load() {
    const { data } = await api.get(`/leads/${id}`);
    setPack(data);
  }

  useEffect(() => {
    load().catch(() => toast.error("Lead missing"));
    api.get("/agents", { params: { role: "agent", limit: 50 } }).then((r) => setAgents(r.data.items || [])).catch(() => {});
  }, [id]);

  if (!pack) return null;
  const { lead, notes, followUps } = pack;

  async function setStatus(status) {
    await api.patch(`/leads/${id}`, { status });
    toast.success("Stage updated");
    load();
  }

  async function addNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/leads/${id}/notes`, { body: note });
    setNote("");
    toast.success("Note filed");
    load();
  }

  return (
    <Page
      kicker="Lead file"
      title={lead.name}
      actions={
        <>
          <button className="btn-ghost" onClick={() => setEdit(true)}>Edit</button>
          <button className="btn-clay" onClick={() => setKill(true)}>Remove</button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs capitalize ${lead.status === s ? "bg-ink-900 text-white" : "bg-paper-100 text-ink-600 hover:bg-paper-200"}`}>
                  {s}
                </button>
              ))}
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
              <Item label="Phone" value={lead.phone} />
              <Item label="Email" value={lead.email || "—"} />
              <Item label="City / area" value={`${lead.city || "—"} · ${lead.area || "—"}`} />
              <Item label="Budget" value={`${money(lead.budgetMin)} – ${money(lead.budgetMax)}`} />
              <Item label="Source" value={lead.source} />
              <Item label="Interest" value={lead.interest} />
              <Item label="Score" value={lead.score} />
              <Item label="Next follow-up" value={day(lead.nextFollowUp)} />
            </dl>
            {lead.notes && <p className="mt-4 border-t border-paper-200 pt-4 text-sm leading-6 text-ink-700">{lead.notes}</p>}
          </Card>
          <Card className="p-5">
            <h2 className="font-serif text-2xl">Notes</h2>
            <form onSubmit={addNote} className="mt-3 flex gap-2">
              <input className="field" placeholder="File a remark after the call…" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn-primary">Add</button>
            </form>
            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li key={n._id} className="rounded-xl bg-paper-50 p-3 text-sm">
                  <p>{n.body}</p>
                  <p className="mt-1 text-xs text-ink-500">{n.author?.name} · {when(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Follow-ups</h2>
            <button className="btn-ghost py-1.5 text-xs" onClick={() => setRemind(true)}>Add</button>
          </div>
          <ul className="mt-4 space-y-3">
            {followUps.map((f) => (
              <li key={f._id} className="flex items-center justify-between rounded-xl border border-paper-200 p-3">
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-ink-500">{when(f.dueAt)}</p>
                </div>
                <Badge status={f.status}>{f.status}</Badge>
              </li>
            ))}
            {followUps.length === 0 && <p className="text-sm text-ink-500">No reminders yet.</p>}
          </ul>
        </Card>
      </div>
      {remind && (
        <RemindForm
          lead={lead}
          onClose={() => setRemind(false)}
          onSaved={() => {
            setRemind(false);
            load();
          }}
        />
      )}
      {edit && (
        <LeadForm
          isAdmin={user.role === "admin"}
          agents={agents}
          initial={{
            ...lead,
            assignedTo: lead.assignedTo?._id || "",
            nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().slice(0, 16) : "",
          }}
          onClose={() => setEdit(false)}
          onSaved={() => {
            setEdit(false);
            load();
          }}
        />
      )}
      {kill && (
        <Confirm
          title="Remove this lead?"
          body="The file leaves the book. Deals already opened stay."
          confirmLabel="Remove"
          tone="danger"
          onClose={() => setKill(false)}
          onConfirm={async () => {
            await api.delete(`/leads/${id}`);
            toast.success("Lead removed");
            navigate("/leads");
          }}
        />
      )}
    </Page>
  );
}

function RemindForm({ lead, onClose, onSaved }) {
  const [title, setTitle] = useState(`Call ${lead.name}`);
  const [dueAt, setDueAt] = useState("");
  const [channel, setChannel] = useState("call");

  async function save() {
    if (!dueAt) return toast.error("Pick a due time");
    await api.post("/follow-ups", { title, relatedType: "lead", relatedId: lead._id, dueAt, channel });
    toast.success("Reminder set");
    onSaved();
  }

  return (
    <Modal
      title="Set a follow-up"
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save reminder</button>
        </>
      }
    >
      <div className="grid gap-3">
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="field" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option>call</option><option>whatsapp</option><option>email</option><option>meeting</option>
        </select>
        <input className="field" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
      </div>
    </Modal>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-500">{label}</dt>
      <dd className="mt-1 capitalize">{value}</dd>
    </div>
  );
}
