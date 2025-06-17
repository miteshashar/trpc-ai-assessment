import { createTRPCClient, httpLink } from "@trpc/client";
import { AppRouter } from "../../server/appRouter";

export class ApiClient {
  private trpc: ReturnType<typeof createTRPCClient<AppRouter>>;

  constructor(url: string = "http://localhost:3000") {
    this.trpc = createTRPCClient<AppRouter>({
      links: [
        httpLink({
          url,
        }),
      ],
    });
  }

  async evaluate(formData: FormData) {
    return await this.trpc.evaluate.mutate(formData);
  }
}