import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Modal, Pagination, Skeleton } from "@/components/ui";
import { money } from "@/lib/format";

const TYPES = ["apartment", "villa", "plot", "commercial", "farmhouse", "penthouse"];

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const status = params.get("status") || "";
  const listingType = params.get("listingType") || "";
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
    const { data: res } = await api.get("/properties", { params: { q, type, status, listingType, page, limit: 9 } });
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => toast.error("Listings failed to load"));
  }, [q, type, status, listingType, page]);

  return (
    <Page
      kicker="Inventory"
      title="Listings"
      actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add property</button>}
    >
      <Card className="grid gap-3 p-4 md:grid-cols-4">
        <input className="field" placeholder="Title, DHA, reference" defaultValue={q} onKeyDown={(e) => e.key === "Enter" && setFilter("q", e.target.value)} />
        <select className="field" value={type} onChange={(e) => setFilter("type", e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="field" value={listingType} onChange={(e) => setFilter("listingType", e.target.value)}>
          <option value="">Sale & rent</option>
          <option value="sale">sale</option>
          <option value="rent">rent</option>
        </select>
        <select className="field" value={status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">Any status</option>
          <option>available</option>
          <option>reserved</option>
          <option>sold</option>
          <option>rented</option>
        </select>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : data.items.length === 0 ? (
        <Card><Empty title="Yard is empty" body="Add a listing or loosen filters." /></Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p) => (
              <Link key={p._id} to={`/properties/${p._id}`} className="group overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-card">
                <div className="relative h-44 overflow-hidden bg-paper-200">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge status={p.status}>{p.status}</Badge>
                    <span className="rounded-full bg-ink-900/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-paper-50">{p.listingType}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ink-500">{p.reference} · {p.type}</p>
                  <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-clay-500">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{p.area}, {p.city}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="font-semibold">{money(p.price)}</p>
                    <p className="text-xs text-ink-500">{p.beds ? `${p.beds} bd` : p.areaSize} {p.beds ? `· ${p.baths} ba` : p.areaUnit}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Card className="mt-2">
            <Pagination page={data.page} pages={data.pages} onPage={(p) => setFilter("page", String(p))} />
          </Card>
        </>
      )}

      {open && <PropertyForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </Page>
  );
}

export function PropertyForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState({
    title: "",
    type: "villa",
    listingType: "sale",
    status: "available",
    price: "",
    city: "Karachi",
    area: "",
    beds: 3,
    baths: 3,
    areaSize: "",
    description: "",
    ...initial,
    images: Array.isArray(initial?.images) ? initial.images.join(", ") : initial?.images || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    if (!form.title || !form.price) return toast.error("Title and price required");
    const payload = {
      ...form,
      price: Number(form.price),
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      areaSize: Number(form.areaSize) || 0,
      images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (initial?._id) await api.patch(`/properties/${initial._id}`, payload);
      else await api.post("/properties", payload);
      toast.success("Listing saved");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  }

  return (
    <Modal
      title={initial ? "Edit listing" : "New listing"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </>
      }
    >
      <form className="grid max-h-[60vh] gap-3 overflow-y-auto sm:grid-cols-2 pr-1">
        <div className="sm:col-span-2">
          <label className="label">Title</label>
          <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="field" value={form.type} onChange={(e) => set("type", e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div>
          <label className="label">Listing</label>
          <select className="field" value={form.listingType} onChange={(e) => set("listingType", e.target.value)}>
            <option>sale</option><option>rent</option>
          </select>
        </div>
        <div>
          <label className="label">Price PKR</label>
          <input className="field" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option>available</option><option>reserved</option><option>sold</option><option>rented</option>
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
          <label className="label">Beds</label>
          <input className="field" type="number" value={form.beds} onChange={(e) => set("beds", e.target.value)} />
        </div>
        <div>
          <label className="label">Baths</label>
          <input className="field" type="number" value={form.baths} onChange={(e) => set("baths", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Size</label>
          <input className="field" type="number" value={form.areaSize} onChange={(e) => set("areaSize", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Image URLs (comma separated)</label>
          <input className="field" value={form.images} onChange={(e) => set("images", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="field min-h-20" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
