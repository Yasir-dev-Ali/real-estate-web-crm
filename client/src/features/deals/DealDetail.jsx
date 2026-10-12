import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Confirm } from "@/components/ui";
import { moneyFull, day } from "@/lib/format";

const STAGES = ["inquiry", "viewing", "offer", "token", "contract", "closed", "lost"];

export default function DealDetail() {
  const { id } = useParams();
  const [pack, setPack] = useState(null);
  const [closing, setClosing] = useState(false);

  async function load() {
    const { data } = await api.get(`/deals/${id}`);
    setPack(data);
  }
  useEffect(() => {
    load().catch(() => toast.error("Deal not found"));
  }, [id]);

  if (!pack) return null;
  const { deal, commission } = pack;

  async function move(stage) {
    if (stage === "closed") {
      setClosing(true);
      return;
    }
    await api.patch(`/deals/${id}`, { stage });
    toast.success(`Moved to ${stage}`);
    load();
  }

  return (
    <Page kicker="Deal file" title={deal.title}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => move(s)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${deal.stage === s ? "bg-ink-900 text-white" : "bg-paper-100 text-ink-600 hover:bg-paper-200"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 font-serif text-4xl">{moneyFull(deal.value)}</p>
          <p className="text-sm text-ink-500">{deal.probability}% probability · expected {day(deal.expectedClose)}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-ink-500">Lead</p>
              <Link className="font-medium hover:text-clay-500" to={`/leads/${deal.lead?._id}`}>{deal.lead?.name}</Link>
            </div>
            <div>
              <p className="text-ink-500">Property</p>
              {deal.property ? (
                <Link className="font-medium hover:text-clay-500" to={`/properties/${deal.property._id}`}>{deal.property.title}</Link>
              ) : "—"}
            </div>
            <div>
              <p className="text-ink-500">Agent</p>
              <p className="font-medium">{deal.agent?.name}</p>
            </div>
            {deal.lostReason && (
              <div>
                <p className="text-ink-500">Lost reason</p>
                <p>{deal.lostReason}</p>
              </div>
            )}
          </dl>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Commission</p>
          {commission ? (
            <>
              <p className="mt-3 font-serif text-3xl">{moneyFull(commission.amount)}</p>
              <p className="text-sm text-ink-500">{commission.rate}% · {commission.status}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-500">Generated automatically when the deal is closed.</p>
          )}
        </Card>
      </div>
      {closing && (
        <Confirm
          title="Close this deal?"
          body="Commission is calculated from the agent’s rate. The listing is marked sold."
          confirmLabel="Close & generate commission"
          onClose={() => setClosing(false)}
          onConfirm={async () => {
            await api.patch(`/deals/${id}`, { stage: "closed" });
            toast.success("Deal closed");
            setClosing(false);
            load();
          }}
        />
      )}
    </Page>
  );
}
