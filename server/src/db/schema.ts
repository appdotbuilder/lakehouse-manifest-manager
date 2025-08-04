
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define enums for PostgreSQL
export const targetPlatformEnum = pgEnum('target_platform', [
  'AWS',
  'Azure',
  'GCP',
  'On-Premise',
  'Kubernetes',
  'Fly.io',
  'Local Dev'
]);

export const keyTechnologyEnum = pgEnum('key_technology', [
  'Apache Iceberg',
  'Delta Lake',
  'Apache Hudi',
  'Trino',
  'Apache Spark',
  'DuckDB',
  'Apache Airflow',
  'dbt',
  'AWS S3/Minio',
  'Azure Blob Storage',
  'Google Cloud Storage',
  'Docker',
  'Kubernetes'
]);

// Manifests table
export const manifestsTable = pgTable('manifests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  target_platform: targetPlatformEnum('target_platform').notNull(),
  key_technologies: text('key_technologies').array().notNull(), // Array of key technologies
  deployment_notes: text('deployment_notes'), // Nullable by default
  region: text('region'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Manifest = typeof manifestsTable.$inferSelect;
export type NewManifest = typeof manifestsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { manifests: manifestsTable };
