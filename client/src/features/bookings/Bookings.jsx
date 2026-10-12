import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Pagination, TableWrap, Th, Td } from "@/components/ui";
import { money, when } from "@/lib/format";

export default function Bookings() {
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data: res } = await api.get("/bookings", { params: { status, page } });
    setData(res);
  }
  useEffect(() => {
    load().catch(() => toast.error("Diary failed"));
  }, [status, page]);

  async function update(id, payload) {
    await api.patch(`/bookings/${id}`, payload);
    toast.success("Diary updated");
    load();
  }

  return (
    <Page kicker="Calendar" title="Diary" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Schedule</button>}>
      <select className="field max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">All statuses</option>
        <option>scheduled</option>
        <option>completed</option>
        <option>cancelled</option>
        <option>no-show</option>
      </select>
      <Card>
        {data.items?.length === 0 ? (
          <Empty title="Nothing on the diary" body="Book a viewing or token meeting." />
        ) : (
          <TableWrap>
            <table className="min-w-full">
              <thead className="border-b border-paper-200 bg-paper-50">
                <tr>
                  <Th>When</Th>
                  <Th>Property</Th>
                  <Th>Client</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {data.items.map((b) => (
                  <tr key={b._id}>
                    <Td>{when(b.scheduledAt)}</Td>
                    <Td>{b.property?.title}</Td>
                    <Td>{b.lead?.name}<p className="text-xs text-ink-500">{b.lead?.phone}</p></Td>
                    <Td className="capitalize">{b.type}</Td>
                    <Td>{b.amount ? money(b.amount) : "—"}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge status={b.status}>{b.status}</Badge>
                        <select className="field py-1" value={b.status} onChange={(e) => update(b._id, { status: e.target.value })}>
                          <option>scheduled</option>
                          <option>completed</option>
                          <option>cancelled</option>
                          <option>no-show</option>
                        </select>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        <Pagination page={data.page} pages={data.pages} onPage={setPage} />
      </Card>
      {open && <BookingForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </Page>
  );
}

function BookingForm({ onClose, onSaved }) {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ property: "", lead: "", type: "viewing", scheduledAt: "", amount: "", notes: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get("/leads", { params: { limit: 50 } }).then((r) => setLeads(r.data.items));
    api.get("/properties", { params: { limit: 50 } }).then((r) => setProperties(r.data.items));
  }, []);

  async function save() {
    if (!form.property || !form.lead || !form.scheduledAt) return toast.error("Property, lead and time required");
    await api.post("/bookings", { ...form, amount: Number(form.amount) || 0 });
    toast.success("Scheduled");
    onSaved();
  }

  return (
    <Modal title="Schedule" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
      <div className="grid gap-3">
        <div>
          <label className="label">Property</label>
          <select className="field" value={form.property} onChange={(e) => set("property", e.target.value)}>
            <option value="">Select</option>
            {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Lead</label>
          <select className="field" value={form.lead} onChange={(e) => set("lead", e.target.value)}>
            <option value="">Select</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="field" value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option>viewing</option><option>token</option><option>booking</option>
          </select>
        </div>
        <div>
          <label className="label">When</label>
          <input className="field" type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
        </div>
        <div>
          <label className="label">Token amount</label>
          <input className="field" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="field" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
