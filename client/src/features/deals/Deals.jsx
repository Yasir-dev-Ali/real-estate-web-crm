import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Pagination, TableWrap, Th, Td, Confirm } from "@/components/ui";
import { money, day } from "@/lib/format";

const STAGES = ["inquiry", "viewing", "offer", "token", "contract", "closed", "lost"];

export default function Deals() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const stage = params.get("stage") || "";
  const page = Number(params.get("page") || 1);

  function setStage(next) {
    const n = new URLSearchParams(params);
    if (next) n.set("stage", next);
    else n.delete("stage");
    n.delete("page");
    setParams(n);
  }
  function setPage(p) {
    const n = new URLSearchParams(params);
    n.set("page", String(p));
    setParams(n);
  }
  const [open, setOpen] = useState(false);
  const [closeDeal, setCloseDeal] = useState(null);

  async function load() {
    const { data: res } = await api.get("/deals", { params: { stage, page, limit: 10 } });
    setData(res);
  }
  useEffect(() => {
    load().catch(() => toast.error("Deals failed"));
  }, [stage, page]);

  async function move(deal, next) {
    if (next === "closed") {
      setCloseDeal(deal);
      return;
    }
    await api.patch(`/deals/${deal._id}`, { stage: next });
    toast.success(`Moved to ${next}`);
    load();
  }

  return (
    <Page kicker="Revenue" title="Deals" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Open deal</button>}>
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-full px-3 py-1 text-xs ${!stage ? "bg-ink-900 text-white" : "bg-white border border-paper-200"}`} onClick={() => setStage("")}>All</button>
        {STAGES.map((s) => (
          <button key={s} className={`rounded-full px-3 py-1 text-xs capitalize ${stage === s ? "bg-ink-900 text-white" : "bg-white border border-paper-200"}`} onClick={() => setStage(s)}>{s}</button>
        ))}
      </div>
      <Card>
        {data.items?.length === 0 ? (
          <Empty title="Pipeline is quiet" body="Open a deal from a qualified lead." />
        ) : (
          <TableWrap>
            <table className="min-w-full">
              <thead className="border-b border-paper-200 bg-paper-50">
                <tr>
                  <Th>Deal</Th>
                  <Th>Value</Th>
                  <Th>Stage</Th>
                  <Th>Close</Th>
                  <Th>Agent</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {data.items.map((d) => (
                  <tr key={d._id} className="hover:bg-paper-50">
                    <Td>
                      <Link className="font-semibold hover:text-clay-500" to={`/deals/${d._id}`}>{d.title}</Link>
                      <p className="text-xs text-ink-500">{d.lead?.name} {d.property ? `· ${d.property.title}` : ""}</p>
                    </Td>
                    <Td>{money(d.value)}</Td>
                    <Td><Badge status={d.stage}>{d.stage}</Badge></Td>
                    <Td>{day(d.expectedClose)}</Td>
                    <Td>{d.agent?.name}</Td>
                    <Td>
                      <select className="field py-1.5" value={d.stage} onChange={(e) => move(d, e.target.value)}>
                        {STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        <Pagination page={data.page} pages={data.pages} onPage={setPage} />
      </Card>
      {open && <DealForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {closeDeal && (
        <Confirm
          title="Close this deal?"
          body="Commission is calculated from the agent's rate and the listing is marked sold."
          confirmLabel="Close & generate commission"
          onClose={() => setCloseDeal(null)}
          onConfirm={async () => {
            await api.patch(`/deals/${closeDeal._id}`, { stage: "closed" });
            toast.success("Deal closed — commission queued");
            setCloseDeal(null);
            load();
          }}
        />
      )}
    </Page>
  );
}

function DealForm({ onClose, onSaved }) {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ title: "", lead: "", property: "", value: "", stage: "inquiry", expectedClose: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get("/leads", { params: { limit: 50 } }).then((r) => setLeads(r.data.items));
    api.get("/properties", { params: { limit: 50 } }).then((r) => setProperties(r.data.items));
  }, []);

  async function save() {
    if (!form.title || !form.lead || !form.value) return toast.error("Title, lead and value required");
    await api.post("/deals", { ...form, value: Number(form.value) });
    toast.success("Deal opened");
    onSaved();
  }

  return (
    <Modal title="Open deal" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Create</button></>}>
      <div className="grid gap-3">
        <div><label className="label">Title</label><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div>
          <label className="label">Lead</label>
          <select className="field" value={form.lead} onChange={(e) => set("lead", e.target.value)}>
            <option value="">Select</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Property</label>
          <select className="field" value={form.property} onChange={(e) => set("property", e.target.value)}>
            <option value="">Optional</option>
            {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
        <div><label className="label">Value PKR</label><input className="field" type="number" value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
        <div><label className="label">Expected close</label><input className="field" type="date" value={form.expectedClose} onChange={(e) => set("expectedClose", e.target.value)} /></div>
      </div>
    </Modal>
  );
}
