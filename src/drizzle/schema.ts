import { relations } from "drizzle-orm";
import {
  boolean,
  inet,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_roles", userRoles);

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const userTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  imageUrl: varchar("imageUrl"),
  password: text(),
  salt: text(),
  role: userRoleEnum().notNull().default("user"),
  lastLogoutAt: timestamp("last_logout_at", { withTimezone: true }),
  createdAt,
  updatedAt,
});

export const sessionTable = pgTable("session", {
  sessionId: text("sessionId").primaryKey(),
  userId: uuid("userId").references(() => userTable.id), // Match userTable.id type
  userRole: text("userRole"),
  expireAt: timestamp("expireAt", { withTimezone: true }).notNull(),
});

export const oAuthProviders = ["discord", "github", "google"] as const;
export type OAuthProvider = (typeof oAuthProviders)[number];
export const oAuthProviderEnum = pgEnum("oauth_provides", oAuthProviders);

export const userOAuthAccountTable = pgTable(
  "user_oauth_accounts",
  {
    userId: uuid()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: oAuthProviderEnum().notNull(),
    providerAccountId: text().notNull().unique(),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.providerAccountId, t.provider] })]
);

export const userOauthAccountRelationships = relations(
  userOAuthAccountTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userOAuthAccountTable.userId],
      references: [userTable.id],
    }),
  })
);

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  priceInCents: real("priceInCents").notNull(),
  filePath: varchar("filePath").notNull(),
  imagePath: varchar("imagePath").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  isAvailableForPurchase: boolean("isAvailableForPurchase")
    .notNull()
    .default(false),
  createdAt,
  updatedAt,
  userId: uuid("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export type productsTableInferSelect = typeof productsTable.$inferSelect;
export type productsTableInferInsert = typeof productsTable.$inferInsert;

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  pricePaidInCents: real("pricePaidInCents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt,
  updatedAt,
  userId: uuid("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  productId: uuid("productId")
    .notNull()
    .references(() => productsTable.id, { onDelete: "restrict" }),
});

export type ordersTableInferSelect = typeof ordersTable.$inferSelect;
export type ordersTableInferInsert = typeof ordersTable.$inferInsert;

export const downloadVerificationTable = pgTable("downloadVerification", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt,
  productId: uuid("productId")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
});

export type downloadVerificationTableInferSelect =
  typeof downloadVerificationTable.$inferSelect;
export type downloadVerificationTableInferInsert =
  typeof downloadVerificationTable.$inferInsert;

export const auditLogTable = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => userTable.id, {
    onDelete: "set null", // Keep logs even if user is deleted
  }),
  action: text("action").notNull(), // e.g., 'login', 'logout', 'password_change'
  ipAddress: inet("ipAddress"), // PostgreSQL inet type for IP storage
  userAgent: text("userAgent"),
  metadata: jsonb("metadata"), // Optional: store additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userRelations = relations(userTable, ({ many }) => ({
  oAuthAccounts: many(userOAuthAccountTable),
  products: many(productsTable), // This will use the relation defined above
  orders: many(ordersTable),
  sessions: many(sessionTable), // Moved here to consolidate user relations
}));

export const sessionsRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId], // Field in THIS table
    references: [userTable.id], // Field in TARGET table
  }),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [productsTable.userId], // The foreign key in recordsTable
    references: [userTable.id], // The primary key in userTable
  }),
  orders: many(ordersTable),
  downloadVerifications: many(downloadVerificationTable),
}));

export const ordersRelations = relations(ordersTable, ({ one }) => ({
  user: one(userTable, {
    fields: [ordersTable.userId],
    references: [userTable.id],
  }),
  product: one(productsTable, {
    fields: [ordersTable.productId],
    references: [productsTable.id],
  }),
}));

export const downloadVerificationRelations = relations(
  downloadVerificationTable,
  ({ one }) => ({
    user: one(productsTable, {
      fields: [downloadVerificationTable.productId], // The foreign key in recordsTable
      references: [productsTable.id], // The primary key in userTable
    }),
  })
);
