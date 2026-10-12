import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(location.state?.notice ? 60 : 0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyEmail(email, code);
      toast.success("Email verified. Your workspace is ready.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not verify your email.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await resendVerification(email);
      setCooldown(60);
      toast.success("A new code has been sent.");
    } catch (err) {
      const wait = Number(err.response?.data?.retryAfter);
      if (wait) setCooldown(wait);
      toast.error(err.response?.data?.message || "Could not send a new code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <p className="font-serif text-4xl text-ink-900">Aurelia</p>
        <h1 className="mt-2 font-serif text-2xl text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Enter the 6-digit code we sent to{" "}
          <span className="font-semibold text-ink-800">{email || "your email address"}</span>.
          The code expires in 10 minutes.
        </p>
        {location.state?.notice && (
          <p className="mt-4 rounded-xl bg-paper-100 px-3 py-2 text-sm text-ink-700" role="status">
            {location.state.notice}
          </p>
        )}
        <label className="label mt-6" htmlFor="verification-code">Verification code</label>
        <input
          id="verification-code"
          className="field text-center text-xl tracking-[0.4em]"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          aria-describedby="verification-help"
        />
        <p id="verification-help" className="mt-2 text-xs text-ink-500">
          The code is single-use. Five incorrect attempts require a new code.
        </p>
        <button className="btn-primary mt-5 w-full" disabled={busy || code.length !== 6 || !email}>
          {busy ? "Verifying…" : "Verify email"}
        </button>
        <button
          type="button"
          className="btn-ghost mt-3 w-full"
          onClick={resend}
          disabled={resending || cooldown > 0 || !email}
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Send a new code in ${cooldown}s`
              : "Send a new code"}
        </button>
        <p className="mt-5 text-center text-sm text-ink-500">
          <Link to="/login" className="font-semibold text-clay-500 hover:text-clay-600">
            Back to sign in
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
