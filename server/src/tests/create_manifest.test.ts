
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type CreateManifestInput } from '../schema';
import { createManifest } from '../handlers/create_manifest';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateManifestInput = {
  name: 'Test Manifest',
  content: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: test-pod',
  target_platform: 'Kubernetes',
  key_technologies: ['Docker', 'Kubernetes'],
  deployment_notes: 'Test deployment notes',
  region: 'us-west-2'
};

describe('createManifest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a manifest', async () => {
    const result = await createManifest(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Manifest');
    expect(result.content).toEqual(testInput.content);
    expect(result.target_platform).toEqual('Kubernetes');
    expect(result.key_technologies).toEqual(['Docker', 'Kubernetes']);
    expect(result.deployment_notes).toEqual('Test deployment notes');
    expect(result.region).toEqual('us-west-2');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save manifest to database', async () => {
    const result = await createManifest(testInput);

    // Query using proper drizzle syntax
    const manifests = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, result.id))
      .execute();

    expect(manifests).toHaveLength(1);
    expect(manifests[0].name).toEqual('Test Manifest');
    expect(manifests[0].content).toEqual(testInput.content);
    expect(manifests[0].target_platform).toEqual('Kubernetes');
    expect(manifests[0].key_technologies).toEqual(['Docker', 'Kubernetes']);
    expect(manifests[0].deployment_notes).toEqual('Test deployment notes');
    expect(manifests[0].region).toEqual('us-west-2');
    expect(manifests[0].created_at).toBeInstanceOf(Date);
    expect(manifests[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const minimalInput: CreateManifestInput = {
      name: 'Minimal Manifest',
      content: 'minimal content',
      target_platform: 'AWS',
      key_technologies: ['Apache Spark'],
      deployment_notes: null,
      region: null
    };

    const result = await createManifest(minimalInput);

    expect(result.name).toEqual('Minimal Manifest');
    expect(result.content).toEqual('minimal content');
    expect(result.target_platform).toEqual('AWS');
    expect(result.key_technologies).toEqual(['Apache Spark']);
    expect(result.deployment_notes).toBeNull();
    expect(result.region).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple key technologies', async () => {
    const multiTechInput: CreateManifestInput = {
      name: 'Multi-Tech Manifest',
      content: 'complex deployment configuration',
      target_platform: 'GCP',
      key_technologies: ['Apache Iceberg', 'Delta Lake', 'Trino', 'Apache Spark', 'dbt'],
      deployment_notes: 'Complex data lakehouse setup',
      region: 'europe-west1'
    };

    const result = await createManifest(multiTechInput);

    expect(result.key_technologies).toEqual([
      'Apache Iceberg',
      'Delta Lake', 
      'Trino',
      'Apache Spark',
      'dbt'
    ]);
    expect(result.target_platform).toEqual('GCP');
    expect(result.deployment_notes).toEqual('Complex data lakehouse setup');
    expect(result.region).toEqual('europe-west1');
  });
});
