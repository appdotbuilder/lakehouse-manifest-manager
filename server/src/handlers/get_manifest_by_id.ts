
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type GetManifestByIdInput, type Manifest, type KeyTechnology } from '../schema';
import { eq } from 'drizzle-orm';

export const getManifestById = async (input: GetManifestByIdInput): Promise<Manifest | null> => {
  try {
    const results = await db.select()
      .from(manifestsTable)
      .where(eq(manifestsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const manifest = results[0];
    return {
      ...manifest,
      key_technologies: manifest.key_technologies as KeyTechnology[]
    };
  } catch (error) {
    console.error('Get manifest by ID failed:', error);
    throw error;
  }
};
