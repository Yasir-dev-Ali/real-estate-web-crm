import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { email } = await register({
        companyName: form.companyName.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        city: form.city.trim(),
        password: form.password,
      });
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
        state: { notice: "We sent a verification code to your email address." },
      });
    } catch (err) {
      if (err.response?.data?.code === "REGISTRATION_PENDING") {
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
        return;
      }
      if (["EMAIL_NOT_CONFIGURED", "EMAIL_DELIVERY_FAILED"].includes(err.response?.data?.code)) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`, {
          state: { notice: err.response.data.message },
        });
        return;
      }
      toast.error(err.response?.data?.message || "Could not create your workspace.");
    } finally {
      setBusy(false);
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
        <h1 className="mt-2 text-sm text-ink-500">Create your brokerage workspace.</h1>
        <p className="mt-1 text-xs leading-5 text-ink-500">
          You’ll be the workspace Admin. Verify your email to finish setup.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="register-company">Brokerage name</label>
            <input
              id="register-company"
              className="field"
              autoComplete="organization"
              minLength={2}
              maxLength={100}
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="register-name">Your name</label>
            <input
              id="register-name"
              className="field"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="register-email">Work email</label>
            <input
              id="register-email"
              className="field"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="register-city">City <span className="font-normal normal-case tracking-normal">(optional)</span></label>
            <input
              id="register-city"
              className="field"
              autoComplete="address-level2"
              maxLength={80}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              required
            />
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-500">
          Use at least 10 characters with uppercase, lowercase and a number.
        </p>
        <button className="btn-primary mt-5 w-full" disabled={busy}>
          {busy ? "Creating workspace…" : "Create workspace"}
        </button>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have a workspace?{" "}
          <Link to="/login" className="font-semibold text-clay-500 hover:text-clay-600">
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
