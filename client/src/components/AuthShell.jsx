export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-paper-50">
          <p className="text-xs uppercase tracking-[0.3em] text-brass-400">
            Karachi · Lahore · Islamabad · Dubai desk
          </p>
          <div>
            <p className="font-serif text-5xl leading-tight">
              The house knows<br />who walked in.
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-ink-300">
              Keep leads, viewings, tokens and commissions together — built for brokerages serving clients at home and abroad.
            </p>
          </div>
          <p className="text-xs text-ink-300">One private workspace for your entire brokerage.</p>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-paper-50 px-6 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}
