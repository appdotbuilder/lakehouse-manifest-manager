
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type DeleteManifestInput, type CreateManifestInput } from '../schema';
import { deleteManifest } from '../handlers/delete_manifest';
import { eq } from 'drizzle-orm';

// Test data for creating a manifest to delete
const testManifestInput: CreateManifestInput = {
  name: 'Test Manifest',
  content: 'Test manifest content for deletion',
  target_platform: 'AWS',
  key_technologies: ['Apache Iceberg', 'Apache Spark'],
  deployment_notes: 'Test deployment notes',
  region: 'us-east-1'
};

describe('deleteManifest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing manifest', async () => {
    // First create a manifest to delete
    const createResult = await db.insert(manifestsTable)
      .values({
        name: testManifestInput.name,
        content: testManifestInput.content,
        target_platform: testManifestInput.target_platform,
        key_technologies: testManifestInput.key_technologies,
        deployment_notes: testManifestInput.deployment_notes,
        region: testManifestInput.region
      })
      .returning()
      .execute();

    const manifestId = createResult[0].id;

    // Delete the manifest
    const deleteInput: DeleteManifestInput = { id: manifestId };
    const result = await deleteManifest(deleteInput);

    // Should return success true
    expect(result.success).toBe(true);

    // Verify the manifest is actually deleted from database
    const manifests = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, manifestId))
      .execute();

    expect(manifests).toHaveLength(0);
  });

  it('should return false for non-existent manifest', async () => {
    // Try to delete a manifest that doesn't exist
    const deleteInput: DeleteManifestInput = { id: 999 };
    const result = await deleteManifest(deleteInput);

    // Should return success false
    expect(result.success).toBe(false);
  });

  it('should not affect other manifests when deleting one', async () => {
    // Create two manifests
    const manifest1 = await db.insert(manifestsTable)
      .values({
        name: 'Manifest 1',
        content: 'Content 1',
        target_platform: 'AWS',
        key_technologies: ['Apache Iceberg'],
        deployment_notes: null,
        region: null
      })
      .returning()
      .execute();

    const manifest2 = await db.insert(manifestsTable)
      .values({
        name: 'Manifest 2',
        content: 'Content 2',
        target_platform: 'Azure',
        key_technologies: ['Delta Lake'],
        deployment_notes: null,
        region: null
      })
      .returning()
      .execute();

    // Delete only the first manifest
    const deleteInput: DeleteManifestInput = { id: manifest1[0].id };
    const result = await deleteManifest(deleteInput);

    expect(result.success).toBe(true);

    // Verify first manifest is deleted
    const deletedManifests = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, manifest1[0].id))
      .execute();

    expect(deletedManifests).toHaveLength(0);

    // Verify second manifest still exists
    const remainingManifests = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, manifest2[0].id))
      .execute();

    expect(remainingManifests).toHaveLength(1);
    expect(remainingManifests[0].name).toEqual('Manifest 2');
  });
});
