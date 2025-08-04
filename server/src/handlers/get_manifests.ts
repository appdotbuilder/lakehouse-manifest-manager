
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type Manifest } from '../schema';
import { desc } from 'drizzle-orm';

export const getManifests = async (): Promise<Manifest[]> => {
  try {
    const results = await db.select()
      .from(manifestsTable)
      .orderBy(desc(manifestsTable.created_at))
      .execute();

    return results.map(manifest => ({
      ...manifest,
      // Convert array of strings back to the proper enum array type
      key_technologies: manifest.key_technologies as any
    }));
  } catch (error) {
    console.error('Failed to fetch manifests:', error);
    throw error;
  }
};
