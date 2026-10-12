import { motion } from "framer-motion";
import { statusTone, initials } from "../lib/format";

export function Page({ title, kicker, actions, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {kicker && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">{kicker}</p>
          )}
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 md:text-4xl">{title}</h1>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}

export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-paper-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function Badge({ children, status, className = "" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusTone(status || children)} ${className}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, src }) {
  if (src) return <img src={src} alt="" className="h-9 w-9 rounded-full object-cover" />;
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-paper-50">
      {initials(name)}
    </div>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 h-px w-16 bg-brass-400" />
      <h3 className="font-serif text-xl text-ink-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-paper-200 ${className}`} />;
}

export function TableWrap({ children }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500 ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-3.5 text-sm text-ink-800 ${className}`}>{children}</td>;
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-paper-200 px-4 py-3 text-sm">
      <span className="text-ink-500">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button className="btn-ghost py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button className="btn-ghost py-1.5" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-3 sm:items-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-card sm:max-h-[calc(100dvh-3rem)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5">
          <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
          <button className="text-ink-500 hover:text-ink-900" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-2">{children}</div>
        {footer && (
          <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-paper-200 bg-white px-5 py-4">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Confirm({ title, body, confirmLabel = "Confirm", tone = "primary", onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className={tone === "danger" ? "btn-clay" : "btn-primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-ink-700">{body}</p>
    </Modal>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="p-8 text-center">
      <p className="font-serif text-xl text-ink-900">Something went sideways</p>
      <p className="mt-2 text-sm text-ink-500">{message || "Please try again."}</p>
      {onRetry && (
        <button className="btn-primary mt-4" onClick={onRetry}>
          Retry
        </button>
      )}
    </Card>
  );
}
