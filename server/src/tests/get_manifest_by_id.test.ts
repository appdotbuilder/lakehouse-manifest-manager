
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type CreateManifestInput, type GetManifestByIdInput } from '../schema';
import { getManifestById } from '../handlers/get_manifest_by_id';

// Test input for creating a manifest
const testCreateInput: CreateManifestInput = {
  name: 'Test Data Pipeline',
  content: 'A comprehensive data pipeline manifest for testing',
  target_platform: 'AWS',
  key_technologies: ['Apache Iceberg', 'Apache Spark', 'AWS S3/Minio'],
  deployment_notes: 'Deploy to us-east-1 region',
  region: 'us-east-1'
};

describe('getManifestById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return manifest when ID exists', async () => {
    // Create a test manifest first
    const createResult = await db.insert(manifestsTable)
      .values({
        name: testCreateInput.name,
        content: testCreateInput.content,
        target_platform: testCreateInput.target_platform,
        key_technologies: testCreateInput.key_technologies,
        deployment_notes: testCreateInput.deployment_notes,
        region: testCreateInput.region
      })
      .returning()
      .execute();

    const createdManifest = createResult[0];

    // Test getting manifest by ID
    const input: GetManifestByIdInput = {
      id: createdManifest.id
    };

    const result = await getManifestById(input);

    // Verify result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdManifest.id);
    expect(result!.name).toEqual('Test Data Pipeline');
    expect(result!.content).toEqual(testCreateInput.content);
    expect(result!.target_platform).toEqual('AWS');
    expect(result!.key_technologies).toEqual(['Apache Iceberg', 'Apache Spark', 'AWS S3/Minio']);
    expect(result!.deployment_notes).toEqual('Deploy to us-east-1 region');
    expect(result!.region).toEqual('us-east-1');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when ID does not exist', async () => {
    const input: GetManifestByIdInput = {
      id: 99999
    };

    const result = await getManifestById(input);

    expect(result).toBeNull();
  });

  it('should handle manifest with null optional fields', async () => {
    // Create manifest with null optional fields
    const createResult = await db.insert(manifestsTable)
      .values({
        name: 'Minimal Manifest',
        content: 'Basic content',
        target_platform: 'GCP',
        key_technologies: ['DuckDB'],
        deployment_notes: null,
        region: null
      })
      .returning()
      .execute();

    const createdManifest = createResult[0];

    const input: GetManifestByIdInput = {
      id: createdManifest.id
    };

    const result = await getManifestById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdManifest.id);
    expect(result!.name).toEqual('Minimal Manifest');
    expect(result!.content).toEqual('Basic content');
    expect(result!.target_platform).toEqual('GCP');
    expect(result!.key_technologies).toEqual(['DuckDB']);
    expect(result!.deployment_notes).toBeNull();
    expect(result!.region).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
