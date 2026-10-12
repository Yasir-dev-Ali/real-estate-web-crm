import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Confirm } from "@/components/ui";
import { moneyFull } from "@/lib/format";
import { PropertyForm } from "@/features/properties/Properties";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [edit, setEdit] = useState(false);
  const [kill, setKill] = useState(false);

  async function load() {
    const { data } = await api.get(`/properties/${id}`);
    setProperty(data.property);
  }
  useEffect(() => {
    load().catch(() => toast.error("Listing not found"));
  }, [id]);

  if (!property) return null;

  return (
    <Page
      kicker={property.reference}
      title={property.title}
      actions={
        <>
          <button className="btn-ghost" onClick={() => setEdit(true)}>Edit</button>
          <button className="btn-clay" onClick={() => setKill(true)}>Delete</button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="overflow-hidden">
          {property.images?.[0] && <img src={property.images[0]} alt="" className="h-72 w-full object-cover" />}
          <div className="p-5">
            <div className="flex gap-2">
              <Badge status={property.status}>{property.status}</Badge>
              <Badge status={property.listingType}>{property.listingType}</Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-700">{property.description}</p>
            {property.amenities?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-paper-100 px-3 py-1 text-xs">{a}</span>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Asking</p>
          <p className="mt-1 font-serif text-3xl">{moneyFull(property.price)}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <Row k="City" v={`${property.area}, ${property.city}`} />
            <Row k="Type" v={property.type} />
            <Row k="Beds / baths" v={`${property.beds || "—"} / ${property.baths || "—"}`} />
            <Row k="Size" v={`${property.areaSize || "—"} ${property.areaUnit}`} />
            <Row k="Listed by" v={property.listedBy?.name} />
          </dl>
        </Card>
      </div>
      {edit && <PropertyForm initial={property} onClose={() => setEdit(false)} onSaved={() => { setEdit(false); load(); }} />}
      {kill && (
        <Confirm
          title="Delete listing?"
          body="It leaves inventory. Linked deals remain."
          confirmLabel="Delete"
          tone="danger"
          onClose={() => setKill(false)}
          onConfirm={async () => {
            await api.delete(`/properties/${id}`);
            toast.success("Listing removed");
            navigate("/properties");
          }}
        />
      )}
    </Page>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4 border-b border-paper-200 pb-2">
      <dt className="text-ink-500">{k}</dt>
      <dd className="capitalize">{v}</dd>
    </div>
  );
}
