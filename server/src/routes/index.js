import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect, authorize } from "../middleware/auth.js";
import {
  emailCodeValidation,
  emailValidation,
  loginValidation,
  registrationValidation,
} from "../middleware/authValidation.js";
import * as auth from "../controllers/authController.js";
import * as users from "../controllers/userController.js";
import * as leads from "../controllers/leadController.js";
import * as properties from "../controllers/propertyController.js";
import * as deals from "../controllers/dealController.js";
import * as bookings from "../controllers/bookingController.js";
import * as commissions from "../controllers/commissionController.js";
import * as followups from "../controllers/followUpController.js";
import * as notifications from "../controllers/notificationController.js";
import * as analytics from "../controllers/analyticsController.js";
import * as search from "../controllers/searchController.js";

const router = Router();

const authLimiter = (limit, windowMs) =>
  rateLimit({
    limit,
    windowMs,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please wait before trying again." },
  });

router.post("/auth/register", authLimiter(5, 60 * 60 * 1000), registrationValidation, auth.register);
router.post("/auth/verify-email", authLimiter(10, 15 * 60 * 1000), emailCodeValidation, auth.verifyEmail);
router.post(
  "/auth/resend-verification",
  authLimiter(5, 60 * 60 * 1000),
  emailValidation,
  auth.resendVerification
);
router.post("/auth/login", authLimiter(10, 15 * 60 * 1000), loginValidation, auth.login);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", protect, auth.me);
router.patch("/auth/me", protect, auth.updateMe);

router.get("/users", protect, authorize("admin"), users.listUsers);
router.post("/users", protect, authorize("admin"), users.createUser);
router.patch("/users/:id", protect, authorize("admin"), users.updateUser);
router.get("/agents", protect, authorize("admin"), users.listUsers);

router.get("/leads", protect, leads.listLeads);
router.post("/leads", protect, leads.createLead);
router.get("/leads/:id", protect, leads.getLead);
router.patch("/leads/:id", protect, leads.updateLead);
router.delete("/leads/:id", protect, leads.deleteLead);
router.post("/leads/:id/notes", protect, leads.addNote);

router.get("/properties", protect, properties.listProperties);
router.post("/properties", protect, properties.createProperty);
router.get("/properties/:id", protect, properties.getProperty);
router.patch("/properties/:id", protect, properties.updateProperty);
router.delete("/properties/:id", protect, properties.deleteProperty);

router.get("/deals", protect, deals.listDeals);
router.post("/deals", protect, deals.createDeal);
router.get("/deals/:id", protect, deals.getDeal);
router.patch("/deals/:id", protect, deals.updateDeal);

router.get("/bookings", protect, bookings.listBookings);
router.post("/bookings", protect, bookings.createBooking);
router.patch("/bookings/:id", protect, bookings.updateBooking);

router.get("/commissions", protect, commissions.listCommissions);
router.patch("/commissions/:id", protect, commissions.updateCommission);

router.get("/follow-ups", protect, followups.listFollowUps);
router.post("/follow-ups", protect, followups.createFollowUp);
router.patch("/follow-ups/:id", protect, followups.updateFollowUp);

router.get("/notifications", protect, notifications.listNotifications);
router.patch("/notifications/:id", protect, notifications.markRead);

router.get("/analytics/dashboard", protect, analytics.dashboard);
router.get("/search", protect, search.globalSearch);

export default router;
