import { z } from "zod";

export const Deployment = z.object({
  domains: z.array(z.string()),
  projectDomain: z.string(),
});

export type Deployment = z.infer<typeof Deployment>;
