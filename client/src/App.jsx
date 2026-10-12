import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";

const Landing = lazy(() => import("./features/marketing/Landing"));
const Login = lazy(() => import("./features/auth/Login"));
const Register = lazy(() => import("./features/auth/Register"));
const VerifyEmail = lazy(() => import("./features/auth/VerifyEmail"));
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const Leads = lazy(() => import("./features/leads/Leads"));
const LeadDetail = lazy(() => import("./features/leads/LeadDetail"));
const Properties = lazy(() => import("./features/properties/Properties"));
const PropertyDetail = lazy(() => import("./features/properties/PropertyDetail"));
const Deals = lazy(() => import("./features/deals/Deals"));
const DealDetail = lazy(() => import("./features/deals/DealDetail"));
const Bookings = lazy(() => import("./features/bookings/Bookings"));
const FollowUps = lazy(() => import("./features/follow-ups/FollowUps"));
const Commissions = lazy(() => import("./features/commissions/Commissions"));
const Agents = lazy(() => import("./features/agents/Agents"));
const Settings = lazy(() => import("./features/settings/Settings"));
const Search = lazy(() => import("./features/search/Search"));

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading page">
      <p className="font-serif text-xl text-ink-500">Preparing your desk…</p>
    </div>
  );
}

function Guard({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper-100">
        <p className="font-serif text-2xl text-ink-700">Opening the floor…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageFallback />;
  if (!user && location.pathname === "/") return <Landing />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: "#12242B", color: "#FBF7F1" } }} />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              <Guest>
                <Login />
              </Guest>
            }
          />
          <Route
            path="/register"
            element={
              <Guest>
                <Register />
              </Guest>
            }
          />
          <Route
            path="/verify-email"
            element={
              <Guest>
                <VerifyEmail />
              </Guest>
            }
          />
          <Route path="/" element={<HomeRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="deals" element={<Deals />} />
            <Route path="deals/:id" element={<DealDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="commissions" element={<Commissions />} />
            <Route
              path="agents"
              element={
                <Guard admin>
                  <Agents />
                </Guard>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
