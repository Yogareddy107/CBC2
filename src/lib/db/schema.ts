import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export const analyses = sqliteTable("analyses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    repo_url: text("repo_url").notNull(),
    sub_path: text("sub_path"),
    base_url: text("base_url"),
    slug: text("slug").unique(),
    status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending"),
    result: text("result", { mode: "json" }),
    result_length: integer("result_length"),
    summary: text("summary"),
    error_message: text("error_message"),
    team_id: text("team_id"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
    return {
        userIdIdx: index("analyses_user_id_idx").on(table.user_id),
        teamIdIdx: index("analyses_team_id_idx").on(table.team_id),
    };
});

export const teams = sqliteTable("teams", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    invite_code: text("invite_code").unique().notNull(),
    owner_id: text("owner_id").notNull(), // Appwrite UserId
    plan: text("plan", { enum: ["free", "pro", "pro_monthly", "pro_yearly", "team_monthly", "team_yearly", "team", "enterprise"] }).default("free"),
    slack_webhook: text("slack_webhook"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const team_members = sqliteTable("team_members", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    team_id: text("team_id").notNull().references(() => teams.id),
    user_id: text("user_id").notNull(), // Appwrite UserId
    role: text("role", { enum: ["admin", "architect", "member"] }).default("member"),
    joined_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const subscriptions = sqliteTable("subscriptions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    razorpay_subscription_id: text("razorpay_subscription_id"),
    razorpay_customer_id: text("razorpay_customer_id"),
    plan: text("plan", { enum: ["free", "pro", "pro_monthly", "pro_yearly", "team_monthly", "team_yearly", "team", "enterprise"] }).default("free"),
    amount: real("amount").notNull(),
    status: text("status", { enum: ["active", "created", "authenticated", "past_due", "halted", "canceled", "paused", "expired", "pending", "completed"] }).notNull(),
    current_period_end: integer("current_period_end"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
    return {
        userIdIdx: index("subscriptions_user_id_idx").on(table.user_id),
    };
});

export const comments = sqliteTable("comments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    analysis_id: text("analysis_id").notNull(),
    user_id: text("user_id").notNull(),
    section_id: text("section_id").notNull(),
    content: text("content").notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    analysisIdIdx: index("comments_analysis_id_idx").on(table.analysis_id),
}));

export const file_reviews = sqliteTable("file_reviews", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    analysis_id: text("analysis_id").notNull(),
    team_id: text("team_id").notNull(),
    file_path: text("file_path").notNull(),
    reviewer_id: text("reviewer_id").notNull(),
    status: text("status", { enum: ["pending", "reviewed", "flagged"] }).default("pending"),
    note: text("note"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    analysisTeamIdx: index("file_reviews_analysis_team_idx").on(table.analysis_id, table.team_id),
}));

export const team_checklists = sqliteTable("team_checklists", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    team_id: text("team_id").notNull().references(() => teams.id),
    title: text("title").notNull(),
    completed: integer("completed", { mode: "boolean" }).default(false),
    assigned_to: text("assigned_to"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    teamIdIdx: index("team_checklists_team_id_idx").on(table.team_id),
}));

export const conversations = sqliteTable("conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    status: text("status", { enum: ["open", "closed"] }).default("open"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index("conversations_user_id_idx").on(table.user_id),
}));

export const messages = sqliteTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversation_id: text("conversation_id").notNull().references(() => conversations.id),
    sender_type: text("sender_type", { enum: ["user", "admin"] }).notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["unread", "read"] }).default("unread"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    convoIdIdx: index("messages_conversation_id_idx").on(table.conversation_id),
}));

export const api_keys = sqliteTable("api_keys", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    key_hash: text("key_hash").notNull().unique(), // We store a hash of the key
    name: text("name").notNull(), // Optional name like "VS Code - Laptop"
    last_used: text("last_used"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index("api_keys_user_id_idx").on(table.user_id),
}));

export const systems = sqliteTable("systems", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    user_id: text("user_id").notNull(),
    team_id: text("team_id"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index("systems_user_id_idx").on(table.user_id),
}));

export const system_analyses = sqliteTable("system_analyses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    system_id: text("system_id").notNull().references(() => systems.id, { onDelete: 'cascade' }),
    analysis_id: text("analysis_id").notNull().references(() => analyses.id, { onDelete: 'cascade' }),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    systemIdIdx: index("system_analyses_system_id_idx").on(table.system_id),
}));

export const governance_rules = sqliteTable("governance_rules", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    team_id: text("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
    created_by: text("created_by").notNull(),
    name: text("name").notNull(),
    description: text("description"), // The natural language rule
    definition: text("definition", { mode: "json" }).notNull(), // { type: 'dependency', from: '**/ui/**', to: '**/db/**', prohibited: true }
    enforced: integer("enforced", { mode: "boolean" }).default(true),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    teamIdIdx: index("governance_rules_team_id_idx").on(table.team_id),
}));

export const notifications = sqliteTable("notifications", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id"), // NULL means it's a broadcast to everyone
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type", { enum: ["info", "warning", "feature", "success"] }).default("info"),
    link: text("link"), // Optional link to a page (e.g. /dashboard)
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.user_id),
}));

export const notification_status = sqliteTable("notification_status", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    notification_id: text("notification_id").notNull().references(() => notifications.id, { onDelete: 'cascade' }),
    is_read: integer("is_read", { mode: "boolean" }).default(false),
    read_at: text("read_at"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userNotifIdx: index("notif_status_user_id_idx").on(table.user_id),
    notifIdIdx: index("notif_status_notif_id_idx").on(table.notification_id),
}));
