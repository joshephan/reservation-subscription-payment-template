import { serial, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { admin } from './admin';

export const adminLog = pgTable('admin_log', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id')
    .notNull()
    .references(() => admin.id),
  action: text('action').notNull(), // 'create', 'update', 'delete', etc.
  targetType: text('target_type').notNull(), // 'user', 'subscription', 'reservation', etc.
  targetId: integer('target_id').notNull(), // ID of the affected entity
  details: text('details').notNull(), // JSON string containing detailed information about the action
  createdAt: timestamp('created_at').defaultNow(),
});

export const adminLogRelations = relations(adminLog, ({ one }) => ({
  admin: one(admin, {
    fields: [adminLog.adminId],
    references: [admin.id],
  }),
}));
