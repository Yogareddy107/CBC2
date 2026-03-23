CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`user_id` text NOT NULL,
	`section_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `comments_analysis_id_idx` ON `comments` (`analysis_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'open',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `conversations_user_id_idx` ON `conversations` (`user_id`);--> statement-breakpoint
CREATE TABLE `file_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`team_id` text NOT NULL,
	`file_path` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `file_reviews_analysis_team_idx` ON `file_reviews` (`analysis_id`,`team_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_type` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'unread',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `team_checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false,
	`assigned_to` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `team_checklists_team_id_idx` ON `team_checklists` (`team_id`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`owner_id` text NOT NULL,
	`plan` text DEFAULT 'free',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_invite_code_unique` ON `teams` (`invite_code`);--> statement-breakpoint
DROP INDEX "analyses_slug_unique";--> statement-breakpoint
DROP INDEX "analyses_user_id_idx";--> statement-breakpoint
DROP INDEX "analyses_team_id_idx";--> statement-breakpoint
DROP INDEX "comments_analysis_id_idx";--> statement-breakpoint
DROP INDEX "conversations_user_id_idx";--> statement-breakpoint
DROP INDEX "file_reviews_analysis_team_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions_user_id_idx";--> statement-breakpoint
DROP INDEX "team_checklists_team_id_idx";--> statement-breakpoint
DROP INDEX "teams_invite_code_unique";--> statement-breakpoint
ALTER TABLE `subscriptions` ALTER COLUMN "current_period_end" TO "current_period_end" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `analyses_slug_unique` ON `analyses` (`slug`);--> statement-breakpoint
CREATE INDEX `analyses_user_id_idx` ON `analyses` (`user_id`);--> statement-breakpoint
CREATE INDEX `analyses_team_id_idx` ON `analyses` (`team_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `plan` text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `analyses` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `analyses` ADD `result_length` integer;--> statement-breakpoint
ALTER TABLE `analyses` ADD `team_id` text;