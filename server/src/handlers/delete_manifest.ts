
import { db } from '../db';
import { manifestsTable } from '../db/schema';
import { type DeleteManifestInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteManifest = async (input: DeleteManifestInput): Promise<{ success: boolean }> => {
  try {
    // Delete the manifest by ID
    const result = await db.delete(manifestsTable)
      .where(eq(manifestsTable.id, input.id))
      .execute();

    // Check if any rows were affected (manifest existed and was deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Manifest deletion failed:', error);
    throw error;
  }
};
