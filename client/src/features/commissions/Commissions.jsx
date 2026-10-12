import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/client";
import { Page, Card, Badge, Empty, Pagination, TableWrap, Th, Td, Confirm } from "@/components/ui";
import { money, day } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

export default function Commissions() {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null);

  async function load() {
    const { data: res } = await api.get("/commissions", { params: { status, page } });
    setData(res);
  }
  useEffect(() => {
    load().catch(() => toast.error("Commission book failed"));
  }, [status, page]);

  return (
    <Page kicker="Payroll" title="Commissions">
      <select className="field max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">All</option>
        <option>pending</option>
        <option>approved</option>
        <option>paid</option>
      </select>
      <Card>
        {data.items?.length === 0 ? (
          <Empty title="No slips yet" body="Close a deal and the split appears here." />
        ) : (
          <TableWrap>
            <table className="min-w-full">
              <thead className="border-b border-paper-200 bg-paper-50">
                <tr>
                  <Th>Agent</Th>
                  <Th>Deal</Th>
                  <Th>Rate</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  {user.role === "admin" && <Th></Th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {data.items.map((c) => (
                  <tr key={c._id}>
                    <Td>{c.agent?.name}</Td>
                    <Td>{c.deal?.title || c.deal?.property?.title}</Td>
                    <Td>{c.rate}%</Td>
                    <Td className="font-semibold">{money(c.amount)}</Td>
                    <Td><Badge status={c.status}>{c.status}</Badge> {c.paidAt && <span className="text-xs text-ink-500">{day(c.paidAt)}</span>}</Td>
                    {user.role === "admin" && (
                      <Td>
                        {c.status === "pending" && <button className="btn-ghost py-1.5 text-xs" onClick={() => setAction({ c, status: "approved" })}>Approve</button>}
                        {c.status === "approved" && <button className="btn-primary py-1.5 text-xs" onClick={() => setAction({ c, status: "paid" })}>Mark paid</button>}
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        <Pagination page={data.page} pages={data.pages} onPage={setPage} />
      </Card>
      {action && (
        <Confirm
          title={action.status === "paid" ? "Release payment?" : "Approve commission?"}
          body="This updates the agent ledger immediately."
          confirmLabel="Confirm"
          onClose={() => setAction(null)}
          onConfirm={async () => {
            await api.patch(`/commissions/${action.c._id}`, { status: action.status });
            toast.success("Ledger updated");
            setAction(null);
            load();
          }}
        />
      )}
    </Page>
  );
}
