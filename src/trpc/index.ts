import { initTRPC } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { NextResponse } from "next/server";
import { authRouter } from "./authRouter";
import { z } from "zod";
import { QueryValidator } from "../lib/validator/QueryValidator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "../lib/razorpay";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PaymentVerificationInput } from "../lib/validator/schema";
import shortid from "shortid";
// import { paymentRouter } from "./paymentRouter";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const generatedSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string
) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error(
      "Razorpay key secret is not defined in environment variables."
    );
  }
  const sig = crypto
    .createHmac("sha256", keySecret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");
  return sig;
};

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

  payment: privateProcedure
    .input(
      z.object({
        amount: z.string(),
        currency: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      let { amount: rawAmount, currency } = input;

      const payment_capture = 1;

      rawAmount = rawAmount.replace("₹", "");

      const amount = Math.round(parseFloat(rawAmount) * 100);

      console.log({ amount, type: typeof amount });

      const options = {
        amount,
        currency,
        receipt: shortid.generate(),
        payment_capture,
        
      };

      try {
        const order = await razorpay.orders.create(options);
        console.log(order);
        return { order };
      } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new Error("Failed to create Razorpay order");
      }
    }),
  paymentVerify: privateProcedure
    .input(PaymentVerificationInput)
    .mutation(async ({ input }) => {
      const { orderCreationId, razorpayPaymentId, razorpaySignature } = input;

      const signature = generatedSignature(orderCreationId, razorpayPaymentId);
      if (signature !== razorpaySignature) {
        return { message: "Payment verification failed", isOk: false };
      }

      return { message: "Payment verified successfully", isOk: true };
    }),
});

export type AppRouter = typeof appRouter;
