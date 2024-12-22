import { defineCollection, z } from "astro:content";
import { getProducts } from "./lib/stripe";

const pasteles = defineCollection({
  loader: async () => {
    const data = await getProducts();
    return data.map((product) => {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        defaultPrice:
          product.default_price && typeof product.default_price !== "string"
            ? {
                id: product.default_price.id,
                currency: product.default_price.currency,
                unitAmount: product.default_price.unit_amount,
                product: product.default_price.product,
              }
            : null,
        active: product.active,
        metadata: {
          tamaño: product.metadata.tamaño,
        },
      };
    });
  },
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()),
    defaultPrice: z
      .object({
        id: z.string(),
        currency: z.string(),
        unitAmount: z.number(),
        product: z.string(),
      })
      .nullable(),
    active: z.boolean(),
    metadata: z.object({
      tamaño: z.string(),
    }),
  }),
});

export const collections = {
  pasteles,
};
