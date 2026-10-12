import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Skeleton } from "@/components/ui";
import { money } from "@/lib/format";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!q) {
      setData({ leads: [], properties: [], deals: [] });
      return;
    }
    setData(null);
    api.get("/search", { params: { q } }).then((r) => setData(r.data));
  }, [q]);

  if (!data) {
    return (
      <Page kicker="Lookup" title={q || "Search"}>
        <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      </Page>
    );
  }

  const empty = !data.leads.length && !data.properties.length && !data.deals.length;

  return (
    <Page kicker="Lookup" title={q ? `Results for “${q}”` : "Search the floor"}>
      {empty ? (
        <Card>
          <Empty title="Nothing matched" body="Try a name, phone, DHA phase, or listing reference." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <ResultCol title="Leads" items={data.leads} to={(x) => `/leads/${x._id}`} primary={(x) => x.name} secondary={(x) => `${x.phone} · ${x.city || ""}`} badge={(x) => x.status} />
          <ResultCol title="Listings" items={data.properties} to={(x) => `/properties/${x._id}`} primary={(x) => x.title} secondary={(x) => `${x.reference} · ${money(x.price)}`} badge={(x) => x.status} />
          <ResultCol title="Deals" items={data.deals} to={(x) => `/deals/${x._id}`} primary={(x) => x.title} secondary={(x) => money(x.value)} badge={(x) => x.stage} />
        </div>
      )}
    </Page>
  );
}

function ResultCol({ title, items, to, primary, secondary, badge }) {
  return (
    <Card>
      <div className="border-b border-paper-200 px-5 py-4">
        <h2 className="font-serif text-xl">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">None in this tray.</p>
      ) : (
        <ul className="divide-y divide-paper-200">
          {items.map((item) => (
            <li key={item._id}>
              <Link to={to(item)} className="block px-5 py-3 hover:bg-paper-50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{primary(item)}</p>
                  {badge(item) && <Badge status={badge(item)}>{badge(item)}</Badge>}
                </div>
                <p className="text-xs text-ink-500">{secondary(item)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
