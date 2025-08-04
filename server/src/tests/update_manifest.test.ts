
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type CreateManifestInput, type UpdateManifestInput } from '../schema';
import { updateManifest } from '../handlers/update_manifest';
import { eq } from 'drizzle-orm';

// Test data for creating a manifest to update
const testManifest: CreateManifestInput = {
  name: 'Test Manifest',
  content: 'Original content',
  target_platform: 'AWS',
  key_technologies: ['Apache Iceberg', 'Apache Spark'],
  deployment_notes: 'Original notes',
  region: 'us-east-1'
};

describe('updateManifest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a manifest', async () => {
    // Create a manifest first
    const created = await db.insert(manifestsTable)
      .values({
        name: testManifest.name,
        content: testManifest.content,
        target_platform: testManifest.target_platform,
        key_technologies: testManifest.key_technologies,
        deployment_notes: testManifest.deployment_notes,
        region: testManifest.region
      })
      .returning()
      .execute();

    const manifestId = created[0].id;

    // Update all fields
    const updateInput: UpdateManifestInput = {
      id: manifestId,
      name: 'Updated Manifest',
      content: 'Updated content',
      target_platform: 'GCP',
      key_technologies: ['DuckDB', 'dbt'],
      deployment_notes: 'Updated notes',
      region: 'us-west-2'
    };

    const result = await updateManifest(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(manifestId);
    expect(result!.name).toEqual('Updated Manifest');
    expect(result!.content).toEqual('Updated content');
    expect(result!.target_platform).toEqual('GCP');
    expect(result!.key_technologies).toEqual(['DuckDB', 'dbt']);
    expect(result!.deployment_notes).toEqual('Updated notes');
    expect(result!.region).toEqual('us-west-2');
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(result!.created_at.getTime());
  });

  it('should update only provided fields', async () => {
    // Create a manifest first
    const created = await db.insert(manifestsTable)
      .values({
        name: testManifest.name,
        content: testManifest.content,
        target_platform: testManifest.target_platform,
        key_technologies: testManifest.key_technologies,
        deployment_notes: testManifest.deployment_notes,
        region: testManifest.region
      })
      .returning()
      .execute();

    const manifestId = created[0].id;
    const originalUpdatedAt = created[0].updated_at;

    // Update only name and content
    const updateInput: UpdateManifestInput = {
      id: manifestId,
      name: 'Partially Updated',
      content: 'New content only'
    };

    const result = await updateManifest(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(manifestId);
    expect(result!.name).toEqual('Partially Updated');
    expect(result!.content).toEqual('New content only');
    // These should remain unchanged
    expect(result!.target_platform).toEqual('AWS');
    expect(result!.key_technologies).toEqual(['Apache Iceberg', 'Apache Spark']);
    expect(result!.deployment_notes).toEqual('Original notes');
    expect(result!.region).toEqual('us-east-1');
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle null values correctly', async () => {
    // Create a manifest first
    const created = await db.insert(manifestsTable)
      .values({
        name: testManifest.name,
        content: testManifest.content,
        target_platform: testManifest.target_platform,
        key_technologies: testManifest.key_technologies,
        deployment_notes: testManifest.deployment_notes,
        region: testManifest.region
      })
      .returning()
      .execute();

    const manifestId = created[0].id;

    // Update nullable fields to null
    const updateInput: UpdateManifestInput = {
      id: manifestId,
      deployment_notes: null,
      region: null
    };

    const result = await updateManifest(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(manifestId);
    expect(result!.deployment_notes).toBeNull();
    expect(result!.region).toBeNull();
    // Other fields should remain unchanged
    expect(result!.name).toEqual('Test Manifest');
    expect(result!.content).toEqual('Original content');
  });

  it('should return null for non-existent manifest', async () => {
    const updateInput: UpdateManifestInput = {
      id: 99999,
      name: 'Non-existent Update'
    };

    const result = await updateManifest(updateInput);

    expect(result).toBeNull();
  });

  it('should persist changes to database', async () => {
    // Create a manifest first
    const created = await db.insert(manifestsTable)
      .values({
        name: testManifest.name,
        content: testManifest.content,
        target_platform: testManifest.target_platform,
        key_technologies: testManifest.key_technologies,
        deployment_notes: testManifest.deployment_notes,
        region: testManifest.region
      })
      .returning()
      .execute();

    const manifestId = created[0].id;

    // Update the manifest
    const updateInput: UpdateManifestInput = {
      id: manifestId,
      name: 'Database Persisted Update',
      target_platform: 'Azure'
    };

    await updateManifest(updateInput);

    // Verify changes were persisted
    const persisted = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, manifestId))
      .execute();

    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toEqual('Database Persisted Update');
    expect(persisted[0].target_platform).toEqual('Azure');
    expect(persisted[0].content).toEqual('Original content'); // Unchanged
  });
});
