import {
    pgTable, text, timestamp, uuid, numeric, smallint,
    boolean, date, time, uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkUserId: text('clerk_user_id').unique().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    whatsapp: text('whatsapp'),
    realEstateAgency: text('real_estate_agency'),
    avatarUrl: text('avatar_url'),
    plan: text('plan').notNull().default('start'),
    planCycleStart: date('plan_cycle_start').notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const workSchedules = pgTable('work_schedules', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    dayOfWeek: smallint('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        userDayIdx: uniqueIndex('user_day_idx').on(table.userId, table.dayOfWeek),
    };
});

export const leads = pgTable('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    source: text('source'),
    status: text('status').notNull().default('waiting'),
    profile: text('profile'),
    budgetRange: text('budget_range'),
    notes: text('notes'),
    scheduledDate: date('scheduled_date').notNull().default(sql`CURRENT_DATE`),
    contactedAt: timestamp('contacted_at', { withTimezone: true }),
    transferredAt: timestamp('transferred_at', { withTimezone: true }),
    quarantineUntil: date('quarantine_until'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'assistant' | 'user'
    content: text('content').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
});

export const properties = pgTable('properties', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type').notNull(),
    city: text('city').notNull(),
    neighborhood: text('neighborhood'),
    address: text('address'),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    areaSqm: numeric('area_sqm', { precision: 8, scale: 2 }),
    bedrooms: smallint('bedrooms'),
    parkingSpots: smallint('parking_spots'),
    standard: text('standard').notNull(),
    targetAudience: text('target_audience').array().notNull().default(sql`'{}'`),
    status: text('status').notNull().default('available'),
    photos: text('photos').array().default(sql`'{}'`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const launches = pgTable('launches', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    developer: text('developer'),
    description: text('description'),
    city: text('city').notNull(),
    neighborhood: text('neighborhood'),
    priceFrom: numeric('price_from', { precision: 12, scale: 2 }),
    deliveryDate: date('delivery_date'),
    standard: text('standard').notNull(),
    targetAudience: text('target_audience').array().notNull().default(sql`'{}'`),
    status: text('status').notNull().default('pre_launch'),
    photos: text('photos').array().default(sql`'{}'`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const launchUnits = pgTable('launch_units', {
    id: uuid('id').primaryKey().defaultRandom(),
    launchId: uuid('launch_id').notNull().references(() => launches.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    areaSqm: numeric('area_sqm', { precision: 8, scale: 2 }),
    bedrooms: smallint('bedrooms'),
    parkingSpots: smallint('parking_spots'),
    price: numeric('price', { precision: 12, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    eventDate: date('event_date').notNull(),
    eventTime: time('event_time'),
    location: text('location'),
    description: text('description'),
    targetAudience: text('target_audience').array().notNull().default(sql`'{}'`),
    standard: text('standard'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const appointments = pgTable('appointments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id').references(() => leads.id),
    propertyId: uuid('property_id').references(() => properties.id),
    launchId: uuid('launch_id').references(() => launches.id),
    title: text('title').notNull(),
    appointmentDate: date('appointment_date').notNull(),
    appointmentTime: time('appointment_time'),
    notes: text('notes'),
    status: text('status').notNull().default('scheduled'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
