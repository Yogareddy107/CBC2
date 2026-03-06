import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const analyses = sqliteTable("analyses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    repo_url: text("repo_url").notNull(),
    status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending"),
    result: text("result", { mode: "json" }),
    result_length: integer("result_length").default(0),
    summary: text("summary"),
    error_message: text("error_message"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
    return {
        userIdIdx: index("analyses_user_id_idx").on(table.user_id),
    };
});

export const subscriptions = sqliteTable("subscriptions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    razorpay_subscription_id: text("razorpay_subscription_id"),
    razorpay_customer_id: text("razorpay_customer_id"),
    plan: text("plan", { enum: ["free", "pro"] }).default("free"), // current plan
    amount: real("amount").notNull(), // amount in rupees/currency
    status: text("status", { enum: ["active", "created", "authenticated", "past_due", "halted", "canceled", "paused", "expired", "pending", "completed"] }).notNull(),
    current_period_end: integer("current_period_end"), // Unix timestamp when plan expires
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
    return {
        userIdIdx: index("subscriptions_user_id_idx").on(table.user_id),
    };
});

export const conversations = sqliteTable("conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull(),
    status: text("status", { enum: ["open", "resolved"] }).default("open"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index("conversations_user_id_idx").on(table.user_id),
}));

export const messages = sqliteTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversation_id: text("conversation_id").notNull(),
    sender_type: text("sender_type", { enum: ["user", "admin"] }).notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["unread", "read"] }).default("unread"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    conversationIdIdx: index("messages_conversation_id_idx").on(table.conversation_id),
}));
