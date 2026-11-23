import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  category: text("category").notNull(),
  town: text("town").notNull(),
  description: text("description").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  address: text("address"),
  hours: text("hours"),
  paymentMethods: text("payment_methods"), // Comma-separated: Kontant, Capitec Pay, eWallet, EFT
  services: text("services"), // JSON string of [{title, price, desc}]
  isVerified: boolean("is_verified").default(true),
  verificationStatus: text("verification_status").default("goedgekeur"), // "goedgekeur", "hangend", "afgekeur"
  subscriptionStatus: text("subscription_status").default("aktief"), // "aktief", "proeftydperk", "agterstallig", "verval"
  subscriptionPlan: text("subscription_plan").default("Gemeenskap Basies (R50/m)"), // "Basies R50/m", "Besigheid R120/m", "Pro R200/m", "Gratis Proef"
  monthlyFee: integer("monthly_fee").default(50),
  subscriptionPaidUntil: timestamp("subscription_paid_until"),
  paymentReference: text("payment_reference"),
  isFeatured: boolean("is_featured").default(false),
  imageUrl: text("image_url"),
  rating: text("rating").default("5.0"),
  reviewCount: integer("review_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  amount: integer("amount").notNull(),
  period: text("period").notNull(), // bv. "Maart 2026", "Kwartaal 1"
  paymentMethod: text("payment_method").notNull(), // "Capitec Pay", "Kontant by Gemeenskapskantoor", "eWallet", "EFT"
  reference: text("reference"),
  status: text("status").default("bevestig"), // "bevestig", "hangend"
  notes: text("notes"),
  recordedBy: text("recorded_by").default("Admin"),
  paidAt: timestamp("paid_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("superadmin"),
  fullName: text("full_name").notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  town: text("town").notNull(),
  price: text("price").notNull(),
  description: text("description").notNull(),
  sellerName: text("seller_name").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  type: text("type").default("sell"), // sell, buy, service
  status: text("status").default("active"), // active, sold
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  seatsAvailable: integer("seats_available").notNull(),
  pricePerSeat: text("price_per_seat").notNull(),
  driverName: text("driver_name").notNull(),
  vehicleInfo: text("vehicle_info"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  notes: text("notes"),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityNotices = pgTable("community_notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // water_krag, kliniek, paaie, skool, basaar, munisipaal, nood
  town: text("town").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  isUrgent: boolean("is_urgent").default(false),
  author: text("author").notNull(),
  contactPhone: text("contact_phone"),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // kliniek, polisie, ambulans, brandweer, munisipaal, sanparks
  town: text("town").notNull(),
  phone: text("phone").notNull(),
  altPhone: text("alt_phone"),
  available: text("available").notNull(),
  notes: text("notes"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
