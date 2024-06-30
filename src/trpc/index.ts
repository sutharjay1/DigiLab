import { initTRPC } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { NextResponse } from "next/server";
import { authRouter } from "./authRouter";
import { z } from "zod";
import { QueryValidator } from "../lib/validator/QueryValidator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "../lib/razorpay";
import Razorpay from "razorpay";
// import { paymentRouter } from "./paymentRouter";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

  payment: privateProcedure.input(z.object({ amount: z.string(), currency: z.string() })).mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const { amount, currency } = input;

      const options = {
        amount,
        currency,
        receipt: "rcp1",
      };

      const order = await razorpay.orders.create(options);
      console.log(order);

      return { order };
    }),

  test: privateProcedure.query(({ ctx }) => {
    return "hello";
  }),
});

export type AppRouter = typeof appRouter;
