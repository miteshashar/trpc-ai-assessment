import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./appRouter";

createHTTPServer({
  router: appRouter,
}).listen(3000);
