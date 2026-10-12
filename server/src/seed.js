import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import { connectDb, disconnectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Property } from "./models/Property.js";
import { Deal } from "./models/Deal.js";
import { Booking } from "./models/Booking.js";
import { Commission } from "./models/Commission.js";
import { FollowUp } from "./models/FollowUp.js";
import { Note } from "./models/Note.js";
import { Notification } from "./models/Notification.js";
import { Tenant } from "./models/Tenant.js";

const TENANT = "aurelia-pk";

const IMAGES = {
  villa:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
  apt: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  plot: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
  commercial:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  pent: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  farm: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
};

export async function seedDatabase({ force = false } = {}) {
  await Tenant.updateOne(
    { tenantId: TENANT },
    { $setOnInsert: { tenantId: TENANT, name: "Aurelia Realty", slug: "aurelia-pk" } },
    { upsert: true }
  );
  const existing = await User.countDocuments({ tenantId: TENANT });
  if (existing && !force) {
    console.log("Seed skipped — tenant already has users");
    return { seeded: false };
  }

  await Promise.all([
    User.deleteMany({ tenantId: TENANT }),
    Lead.deleteMany({ tenantId: TENANT }),
    Property.deleteMany({ tenantId: TENANT }),
    Deal.deleteMany({ tenantId: TENANT }),
    Booking.deleteMany({ tenantId: TENANT }),
    Commission.deleteMany({ tenantId: TENANT }),
    FollowUp.deleteMany({ tenantId: TENANT }),
    Note.deleteMany({ tenantId: TENANT }),
    Notification.deleteMany({ tenantId: TENANT }),
  ]);

  const admin = await User.create({
    tenantId: TENANT,
    name: "Zara Malik",
    email: "admin@aurelia.pk",
    password: "Admin@123",
    role: "admin",
    emailVerified: true,
    phone: "+92 300 5550101",
    city: "Karachi",
    title: "Principal Broker",
    commissionRate: 0,
  });

  const [a1, a2, a3] = await User.create([
    {
      tenantId: TENANT,
      name: "Hamza Qureshi",
      email: "hamza@aurelia.pk",
      password: "Agent@123",
      role: "agent",
      emailVerified: true,
      phone: "+92 321 8882211",
      city: "Karachi",
      title: "Senior Consultant — South",
      commissionRate: 2.75,
    },
    {
      tenantId: TENANT,
      name: "Ayesha Rehman",
      email: "ayesha@aurelia.pk",
      password: "Agent@123",
      role: "agent",
      emailVerified: true,
      phone: "+92 333 4412098",
      city: "Lahore",
      title: "Consultant — Punjab",
      commissionRate: 2.5,
    },
    {
      tenantId: TENANT,
      name: "Omar Siddiqui",
      email: "omar@aurelia.pk",
      password: "Agent@123",
      role: "agent",
      emailVerified: true,
      phone: "+92 345 6671200",
      city: "Islamabad",
      title: "Consultant — Capital",
      commissionRate: 2.4,
    },
  ]);

  const leads = await Lead.create([
    {
      tenantId: TENANT,
      name: "Bilal Hussain",
      email: "bilal.h@example.com",
      phone: "+92 300 1122334",
      source: "zameen",
      status: "viewing",
      interest: "buy",
      budgetMin: 45000000,
      budgetMax: 65000000,
      city: "Karachi",
      area: "DHA Phase 6",
      assignedTo: a1._id,
      createdBy: admin._id,
      nextFollowUp: days(1),
      score: 82,
      tags: ["family", "villa"],
      notes: "Wants a west-open 500 yard house, school run to Bay View.",
    },
    {
      tenantId: TENANT,
      name: "Sara Khan",
      email: "sara.k@example.com",
      phone: "+92 321 9988776",
      source: "referral",
      status: "negotiation",
      interest: "buy",
      budgetMin: 28000000,
      budgetMax: 34000000,
      city: "Lahore",
      area: "DHA Rahbar",
      assignedTo: a2._id,
      createdBy: a2._id,
      nextFollowUp: days(0),
      score: 91,
      tags: ["hot", "first-home"],
    },
    {
      tenantId: TENANT,
      name: "Noman Ali",
      email: "noman@example.com",
      phone: "+92 333 2211009",
      source: "whatsapp",
      status: "qualified",
      interest: "invest",
      budgetMin: 12000000,
      budgetMax: 18000000,
      city: "Karachi",
      area: "Bahria Town",
      assignedTo: a1._id,
      createdBy: a1._id,
      nextFollowUp: days(2),
      score: 70,
      tags: ["investor"],
    },
    {
      tenantId: TENANT,
      name: "Fatima Zahra",
      email: "fatima.z@example.com",
      phone: "+92 345 6677889",
      source: "website",
      status: "contacted",
      interest: "rent",
      budgetMin: 180000,
      budgetMax: 250000,
      city: "Islamabad",
      area: "F-11",
      assignedTo: a3._id,
      createdBy: a3._id,
      nextFollowUp: days(1),
      score: 58,
    },
    {
      tenantId: TENANT,
      name: "Richard Cole",
      email: "r.cole@example.com",
      phone: "+44 7700 900123",
      source: "campaign",
      status: "new",
      interest: "buy",
      budgetMin: 85000000,
      budgetMax: 140000000,
      city: "Karachi",
      area: "Clifton Block 2",
      assignedTo: a1._id,
      createdBy: admin._id,
      nextFollowUp: days(3),
      score: 64,
      tags: ["overseas", "uk"],
    },
    {
      tenantId: TENANT,
      name: "Maham Javed",
      email: "maham@example.com",
      phone: "+92 302 4455667",
      source: "walk-in",
      status: "won",
      interest: "buy",
      budgetMin: 22000000,
      budgetMax: 25000000,
      city: "Lahore",
      area: "Gulberg III",
      assignedTo: a2._id,
      createdBy: a2._id,
      score: 95,
    },
    {
      tenantId: TENANT,
      name: "Usman Tariq",
      email: "usman.t@example.com",
      phone: "+92 313 7788990",
      source: "olx",
      status: "lost",
      interest: "buy",
      budgetMin: 9000000,
      budgetMax: 11000000,
      city: "Rawalpindi",
      area: "Bahria Phase 8",
      assignedTo: a3._id,
      createdBy: a3._id,
      score: 30,
    },
    {
      tenantId: TENANT,
      name: "Hina Sheikh",
      email: "hina.s@example.com",
      phone: "+92 301 2233445",
      source: "website",
      status: "new",
      interest: "buy",
      budgetMin: 16000000,
      budgetMax: 20000000,
      city: "Karachi",
      area: "PECHS Block 2",
      assignedTo: a1._id,
      createdBy: admin._id,
      nextFollowUp: days(0),
      score: 61,
    },
  ]);

  const properties = await Property.create([
    {
      tenantId: TENANT,
      title: "West-open 500 yd villa, DHA Phase 6",
      reference: "AUR-0001",
      type: "villa",
      listingType: "sale",
      status: "available",
      price: 58500000,
      city: "Karachi",
      area: "DHA Phase 6",
      address: "Street 12, Khayaban-e-Shaheen",
      beds: 5,
      baths: 6,
      areaSize: 500,
      yearBuilt: 2018,
      amenities: ["pool", "servant quarter", "solar", "car porch"],
      description:
        "Quiet street, mature trees, marble foyer. Owner relocating to Dubai and priced to transact this quarter.",
      images: [IMAGES.villa],
      listedBy: a1._id,
      featured: true,
    },
    {
      tenantId: TENANT,
      title: "Corner penthouse, Clifton Block 2",
      reference: "AUR-0002",
      type: "penthouse",
      listingType: "sale",
      status: "available",
      price: 125000000,
      city: "Karachi",
      area: "Clifton",
      address: "Sea View Road",
      beds: 4,
      baths: 5,
      areaSize: 3200,
      areaUnit: "sqft",
      amenities: ["sea view", "private lift", "gym"],
      description: "Full Arabian Sea frontage, wrap terrace, dual parking.",
      images: [IMAGES.pent],
      listedBy: a1._id,
      featured: true,
    },
    {
      tenantId: TENANT,
      title: "3-bed apartment, Gulberg III",
      reference: "AUR-0003",
      type: "apartment",
      listingType: "sale",
      status: "sold",
      price: 23500000,
      city: "Lahore",
      area: "Gulberg III",
      address: "MM Alam hinterland",
      beds: 3,
      baths: 3,
      areaSize: 2100,
      areaUnit: "sqft",
      amenities: ["lift", "backup", "society"],
      description: "Recently renovated kitchen, covered parking.",
      images: [IMAGES.apt],
      listedBy: a2._id,
    },
    {
      tenantId: TENANT,
      title: "1 kanal plot, DHA Rahbar Phase 2",
      reference: "AUR-0004",
      type: "plot",
      listingType: "sale",
      status: "reserved",
      price: 31500000,
      city: "Lahore",
      area: "DHA Rahbar",
      beds: 0,
      baths: 0,
      areaSize: 500,
      description: "Park-facing, possession file, transfer-ready.",
      images: [IMAGES.plot],
      listedBy: a2._id,
    },
    {
      tenantId: TENANT,
      title: "F-11 furnished flat — rent",
      reference: "AUR-0005",
      type: "apartment",
      listingType: "rent",
      status: "available",
      price: 220000,
      city: "Islamabad",
      area: "F-11/2",
      beds: 3,
      baths: 3,
      areaSize: 1800,
      areaUnit: "sqft",
      amenities: ["furnished", "generator"],
      description: "Diplomat-friendly, walking distance to Markaz.",
      images: [IMAGES.apt],
      listedBy: a3._id,
    },
    {
      tenantId: TENANT,
      title: "Ground-plus-one shop, Saddar",
      reference: "AUR-0006",
      type: "commercial",
      listingType: "sale",
      status: "available",
      price: 42000000,
      city: "Karachi",
      area: "Saddar",
      areaSize: 80,
      description: "Frontage on Abdullah Haroon, sitting tenants till Dec.",
      images: [IMAGES.commercial],
      listedBy: a1._id,
    },
    {
      tenantId: TENANT,
      title: "Farmhouse weekend home, Super Highway",
      reference: "AUR-0007",
      type: "farmhouse",
      listingType: "sale",
      status: "available",
      price: 38000000,
      city: "Karachi",
      area: "Super Highway",
      beds: 4,
      baths: 4,
      areaSize: 2000,
      amenities: ["lawn", "bore", "boundary"],
      description: "Forty minutes from DHA, fruit trees, guest annex.",
      images: [IMAGES.farm],
      listedBy: a1._id,
    },
    {
      tenantId: TENANT,
      title: "Bahria Town 125 yd investment house",
      reference: "AUR-0008",
      type: "villa",
      listingType: "sale",
      status: "available",
      price: 15500000,
      city: "Karachi",
      area: "Bahria Precinct 10",
      beds: 3,
      baths: 3,
      areaSize: 125,
      images: [IMAGES.villa],
      listedBy: a1._id,
    },
  ]);

  const deals = await Deal.create([
    {
      tenantId: TENANT,
      title: "Hussain — DHA 6 villa",
      lead: leads[0]._id,
      property: properties[0]._id,
      agent: a1._id,
      stage: "viewing",
      value: 58500000,
      probability: 30,
      expectedClose: days(21),
    },
    {
      tenantId: TENANT,
      title: "Sara — Rahbar plot",
      lead: leads[1]._id,
      property: properties[3]._id,
      agent: a2._id,
      stage: "token",
      value: 31500000,
      probability: 70,
      expectedClose: days(10),
    },
    {
      tenantId: TENANT,
      title: "Maham — Gulberg apartment",
      lead: leads[5]._id,
      property: properties[2]._id,
      agent: a2._id,
      stage: "closed",
      value: 23500000,
      probability: 100,
      expectedClose: days(-8),
      closedAt: days(-6),
    },
    {
      tenantId: TENANT,
      title: "Cole — Clifton penthouse",
      lead: leads[4]._id,
      property: properties[1]._id,
      agent: a1._id,
      stage: "inquiry",
      value: 125000000,
      probability: 15,
      expectedClose: days(45),
    },
    {
      tenantId: TENANT,
      title: "Noman — Bahria 125",
      lead: leads[2]._id,
      property: properties[7]._id,
      agent: a1._id,
      stage: "offer",
      value: 15200000,
      probability: 50,
      expectedClose: days(18),
    },
    {
      tenantId: TENANT,
      title: "Usman — Bahria Pindi",
      lead: leads[6]._id,
      agent: a3._id,
      stage: "lost",
      value: 10500000,
      probability: 0,
      lostReason: "Financing fell through",
    },
  ]);

  await Commission.create({
    tenantId: TENANT,
    deal: deals[2]._id,
    agent: a2._id,
    rate: 2.5,
    amount: Math.round(23500000 * 0.025),
    status: "approved",
  });

  await Booking.create([
    {
      tenantId: TENANT,
      property: properties[0]._id,
      lead: leads[0]._id,
      agent: a1._id,
      type: "viewing",
      status: "scheduled",
      scheduledAt: hours(30),
      notes: "Bring floor files and society NOC copy.",
    },
    {
      tenantId: TENANT,
      property: properties[3]._id,
      lead: leads[1]._id,
      agent: a2._id,
      type: "token",
      status: "scheduled",
      scheduledAt: hours(8),
      amount: 500000,
    },
    {
      tenantId: TENANT,
      property: properties[4]._id,
      lead: leads[3]._id,
      agent: a3._id,
      type: "viewing",
      status: "scheduled",
      scheduledAt: hours(52),
    },
  ]);

  await FollowUp.create([
    {
      tenantId: TENANT,
      title: "Call Bilal after Saturday viewing",
      relatedType: "lead",
      relatedId: leads[0]._id,
      assignedTo: a1._id,
      dueAt: days(1),
      channel: "call",
    },
    {
      tenantId: TENANT,
      title: "Send token draft to Sara's lawyer",
      relatedType: "deal",
      relatedId: deals[1]._id,
      assignedTo: a2._id,
      dueAt: days(0),
      channel: "email",
    },
    {
      tenantId: TENANT,
      title: "WhatsApp Hina listing pack",
      relatedType: "lead",
      relatedId: leads[7]._id,
      assignedTo: a1._id,
      dueAt: hours(4),
      channel: "whatsapp",
    },
    {
      tenantId: TENANT,
      title: "UK time call with Richard Cole",
      relatedType: "lead",
      relatedId: leads[4]._id,
      assignedTo: a1._id,
      dueAt: days(3),
      channel: "call",
    },
  ]);

  await Note.create([
    {
      tenantId: TENANT,
      relatedType: "lead",
      relatedId: leads[0]._id,
      author: a1._id,
      body: "Prefers not to look at east-open plots. Wife deciding on kitchen layout.",
    },
    {
      tenantId: TENANT,
      relatedType: "lead",
      relatedId: leads[1]._id,
      author: a2._id,
      body: "Father joining token meeting. Cash + Meezan house finance mix.",
    },
  ]);

  await Notification.create([
    {
      tenantId: TENANT,
      user: admin._id,
      title: "Token meeting today",
      body: "Sara Khan — DHA Rahbar plot. Hamza's counterpart in Lahore is leading.",
      type: "booking",
      link: "/bookings",
    },
    {
      tenantId: TENANT,
      user: a1._id,
      title: "Follow-up due",
      body: "WhatsApp Hina Sheikh the PECHS pack before evening.",
      type: "followup",
      link: "/follow-ups",
    },
    {
      tenantId: TENANT,
      user: a2._id,
      title: "Commission approved",
      body: "Gulberg III apartment — PKR 587,500 ready for payroll.",
      type: "commission",
      link: "/commissions",
    },
  ]);

  console.log("Seeded the Aurelia demo workspace. Demo credentials are for local development only.");
  return { seeded: true };
}

async function run() {
  await connectDb();
  try {
    await seedDatabase({ force: true });
  } finally {
    await disconnectDb();
  }
}

function days(n) {
  return new Date(Date.now() + n * 86400000);
}
function hours(n) {
  return new Date(Date.now() + n * 3600000);
}

const isCli = path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url);
if (isCli) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
