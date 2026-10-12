import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      toast.error(err.response?.data?.message || "Could not sign in");
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
        <h1 className="mt-2 text-sm text-ink-500">Sign in to your brokerage workspace.</h1>
        <label className="label mt-8" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          className="field"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="label mt-4" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          className="field"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary mt-6 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-6 text-center text-sm text-ink-500">
          New to Aurelia?{" "}
          <Link to="/register" className="font-semibold text-clay-500 hover:text-clay-600">
            Create a brokerage workspace
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
