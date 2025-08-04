
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type UpdateManifestInput, type Manifest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateManifest = async (input: UpdateManifestInput): Promise<Manifest | null> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    if (input.target_platform !== undefined) {
      updateData.target_platform = input.target_platform;
    }
    if (input.key_technologies !== undefined) {
      updateData.key_technologies = input.key_technologies;
    }
    if (input.deployment_notes !== undefined) {
      updateData.deployment_notes = input.deployment_notes;
    }
    if (input.region !== undefined) {
      updateData.region = input.region;
    }

    // Update the manifest
    const result = await db.update(manifestsTable)
      .set(updateData)
      .where(eq(manifestsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no manifest was found
    if (result.length === 0) {
      return null;
    }

    // Cast the database result to match the Manifest type
    const dbResult = result[0];
    return {
      ...dbResult,
      key_technologies: dbResult.key_technologies as Manifest['key_technologies']
    };
  } catch (error) {
    console.error('Manifest update failed:', error);
    throw error;
  }
};
