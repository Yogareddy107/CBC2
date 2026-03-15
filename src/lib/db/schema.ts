import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const analyses = sqliteTable("analyses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    repo_url: text("repo_url").notNull(),
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
    owner_id: text("owner_id").notNull(), // Appwrite UserId
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const team_members = sqliteTable("team_members", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    team_id: text("team_id").notNull().references(() => teams.id),
    user_id: text("user_id").notNull(), // Appwrite UserId
    role: text("role", { enum: ["admin", "member"] }).default("member"),
    joined_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const subscriptions = sqliteTable("subscriptions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    razorpay_subscription_id: text("razorpay_subscription_id"),
    razorpay_customer_id: text("razorpay_customer_id"),
    plan: text("plan", { enum: ["free", "pro"] }).default("free"),
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
    status: text("status", { enum: ["reviewed", "unreviewed"] }).default("reviewed"),
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
