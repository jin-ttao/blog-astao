import { defineCollection, z } from "astro:content";

const all = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { all };
