
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createManifestInputSchema, 
  updateManifestInputSchema, 
  getManifestByIdInputSchema, 
  deleteManifestInputSchema 
} from './schema';
import { createManifest } from './handlers/create_manifest';
import { getManifests } from './handlers/get_manifests';
import { getManifestById } from './handlers/get_manifest_by_id';
import { updateManifest } from './handlers/update_manifest';
import { deleteManifest } from './handlers/delete_manifest';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Manifest CRUD operations
  createManifest: publicProcedure
    .input(createManifestInputSchema)
    .mutation(({ input }) => createManifest(input)),
    
  getManifests: publicProcedure
    .query(() => getManifests()),
    
  getManifestById: publicProcedure
    .input(getManifestByIdInputSchema)
    .query(({ input }) => getManifestById(input)),
    
  updateManifest: publicProcedure
    .input(updateManifestInputSchema)
    .mutation(({ input }) => updateManifest(input)),
    
  deleteManifest: publicProcedure
    .input(deleteManifestInputSchema)
    .mutation(({ input }) => deleteManifest(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
