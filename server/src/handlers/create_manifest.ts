
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type CreateManifestInput, type Manifest } from '../schema';

export const createManifest = async (input: CreateManifestInput): Promise<Manifest> => {
  try {
    // Insert manifest record
    const result = await db.insert(manifestsTable)
      .values({
        name: input.name,
        content: input.content,
        target_platform: input.target_platform,
        key_technologies: input.key_technologies, // Array is stored directly
        deployment_notes: input.deployment_notes,
        region: input.region
      })
      .returning()
      .execute();

    // Cast key_technologies from string[] to the expected union type array
    const manifest = result[0];
    return {
      ...manifest,
      key_technologies: manifest.key_technologies as Manifest['key_technologies']
    };
  } catch (error) {
    console.error('Manifest creation failed:', error);
    throw error;
  }
};
