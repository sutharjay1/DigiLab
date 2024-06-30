import { z } from "zod";
import Razorpay from "razorpay";
import { privateProcedure, router } from "../trpc/trpc";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentRouter = router({
  createOrder: privateProcedure
    .input(
      z.object({
        amount: z.string(),
        currency: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const { amount, currency } = input;

      const options = {
        amount,
        currency,
        receipt: "rcp1",
      };    

      const order = await razorpay.orders.create(options);
      console.log(order);

      return { orderId: order.id };
    }),
});
