import { initTRPC } from "@trpc/server";
import { publicProcedure, router } from "./trpc";
import { NextResponse } from "next/server";
import { authRouter } from "./authRouter";
import { z } from "zod";
import { QueryValidator } from "../lib/validator/QueryValidator";
import { getPayloadClient } from "../get-payload";

export const appRouter = router({
  auth: authRouter,

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(),
        query: QueryValidator,
      })
    )
    .query(async ({ input }) => {
      const { query, cursor } = input;
      const { sort, limit, ...queryOpts } = query;

      const payload = await getPayloadClient({
        initOptions: {
          secret: process.env.PAYLOAD_SECRET,
        },
      });

      const parsedQueryOpts: Record<
        string,
        {
          equals: string;
        }
      > = {};

      Object.entries(queryOpts).forEach(([key, value]) => {
        parsedQueryOpts[key] = {
          equals: value,
        };
      });

      const page = cursor ? cursor : 1;

      const {
        docs: items,
        hasNextPage,
        nextPage,
      } = await payload.find({
        collection: "products",
        where: {
          approvedForSale: {
            equals: "approved",
          },
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      });

      return {
        items,
        nextPage: hasNextPage ? nextPage : null,
      };
    }),
});

export type AppRouter = typeof appRouter;
