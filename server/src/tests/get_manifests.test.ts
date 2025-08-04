
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type CreateManifestInput } from '../schema';
import { getManifests } from '../handlers/get_manifests';

// Test data for creating manifests
const testManifest1: CreateManifestInput = {
  name: 'Test Manifest 1',
  content: 'version: 1.0\nservices:\n  - name: test',
  target_platform: 'AWS',
  key_technologies: ['Apache Iceberg', 'Apache Spark'],
  deployment_notes: 'Test deployment notes',
  region: 'us-east-1'
};

const testManifest2: CreateManifestInput = {
  name: 'Test Manifest 2',
  content: 'version: 2.0\nservices:\n  - name: test2',
  target_platform: 'Azure',
  key_technologies: ['Delta Lake', 'dbt'],
  deployment_notes: null,
  region: null
};

describe('getManifests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no manifests exist', async () => {
    const result = await getManifests();
    expect(result).toEqual([]);
  });

  it('should return all manifests ordered by creation date (newest first)', async () => {
    // Create test manifests with slight delay to ensure different timestamps
    await db.insert(manifestsTable).values({
      name: testManifest1.name,
      content: testManifest1.content,
      target_platform: testManifest1.target_platform,
      key_technologies: testManifest1.key_technologies,
      deployment_notes: testManifest1.deployment_notes,
      region: testManifest1.region
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(manifestsTable).values({
      name: testManifest2.name,
      content: testManifest2.content,
      target_platform: testManifest2.target_platform,
      key_technologies: testManifest2.key_technologies,
      deployment_notes: testManifest2.deployment_notes,
      region: testManifest2.region
    }).execute();

    const result = await getManifests();

    expect(result).toHaveLength(2);
    
    // Verify newest first ordering
    expect(result[0].name).toEqual('Test Manifest 2');
    expect(result[1].name).toEqual('Test Manifest 1');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return manifests with correct field values', async () => {
    await db.insert(manifestsTable).values({
      name: testManifest1.name,
      content: testManifest1.content,
      target_platform: testManifest1.target_platform,
      key_technologies: testManifest1.key_technologies,
      deployment_notes: testManifest1.deployment_notes,
      region: testManifest1.region
    }).execute();

    const result = await getManifests();

    expect(result).toHaveLength(1);
    const manifest = result[0];

    expect(manifest.id).toBeDefined();
    expect(manifest.name).toEqual('Test Manifest 1');
    expect(manifest.content).toEqual('version: 1.0\nservices:\n  - name: test');
    expect(manifest.target_platform).toEqual('AWS');
    expect(manifest.key_technologies).toEqual(['Apache Iceberg', 'Apache Spark']);
    expect(manifest.deployment_notes).toEqual('Test deployment notes');
    expect(manifest.region).toEqual('us-east-1');
    expect(manifest.created_at).toBeInstanceOf(Date);
    expect(manifest.updated_at).toBeInstanceOf(Date);
  });

  it('should handle manifests with null values correctly', async () => {
    await db.insert(manifestsTable).values({
      name: testManifest2.name,
      content: testManifest2.content,
      target_platform: testManifest2.target_platform,
      key_technologies: testManifest2.key_technologies,
      deployment_notes: testManifest2.deployment_notes,
      region: testManifest2.region
    }).execute();

    const result = await getManifests();

    expect(result).toHaveLength(1);
    const manifest = result[0];

    expect(manifest.name).toEqual('Test Manifest 2');
    expect(manifest.target_platform).toEqual('Azure');
    expect(manifest.key_technologies).toEqual(['Delta Lake', 'dbt']);
    expect(manifest.deployment_notes).toBeNull();
    expect(manifest.region).toBeNull();
  });
});
