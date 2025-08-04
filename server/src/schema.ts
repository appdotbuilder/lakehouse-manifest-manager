
import { z } from 'zod';

// Enum schemas for predefined options
export const targetPlatformSchema = z.enum([
  'AWS',
  'Azure',
  'GCP',
  'On-Premise',
  'Kubernetes',
  'Fly.io',
  'Local Dev'
]);

export const keyTechnologySchema = z.enum([
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

// Manifest schema
export const manifestSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  target_platform: targetPlatformSchema,
  key_technologies: z.array(keyTechnologySchema),
  deployment_notes: z.string().nullable(),
  region: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Manifest = z.infer<typeof manifestSchema>;
export type TargetPlatform = z.infer<typeof targetPlatformSchema>;
export type KeyTechnology = z.infer<typeof keyTechnologySchema>;

// Input schema for creating manifests
export const createManifestInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  target_platform: targetPlatformSchema,
  key_technologies: z.array(keyTechnologySchema).min(1, 'At least one technology must be selected'),
  deployment_notes: z.string().nullable(),
  region: z.string().nullable()
});

export type CreateManifestInput = z.infer<typeof createManifestInputSchema>;

// Input schema for updating manifests
export const updateManifestInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  target_platform: targetPlatformSchema.optional(),
  key_technologies: z.array(keyTechnologySchema).min(1, 'At least one technology must be selected').optional(),
  deployment_notes: z.string().nullable().optional(),
  region: z.string().nullable().optional()
});

export type UpdateManifestInput = z.infer<typeof updateManifestInputSchema>;

// Schema for getting manifest by ID
export const getManifestByIdInputSchema = z.object({
  id: z.number()
});

export type GetManifestByIdInput = z.infer<typeof getManifestByIdInputSchema>;

// Schema for deleting manifest
export const deleteManifestInputSchema = z.object({
  id: z.number()
});

export type DeleteManifestInput = z.infer<typeof deleteManifestInputSchema>;
