import { z } from "zod";

export const AuthCredentialsValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

export type TAuthCredentialsValidator = z.infer<
  typeof AuthCredentialsValidator
>;

export const QueryValidator = z.object({
  category: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  limit: z.number().optional(),
});

export type TQueryValidator = z.infer<typeof QueryValidator>;

export const PaymentVerificationInput = z.object({
  orderCreationId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type PaymentVerificationInputType = z.infer<
  typeof PaymentVerificationInput
>;

export const PaymentVerificationResponse = z.object({
  message: z.string(),
  isOk: z.boolean(),
});

export type PaymentVerificationResponseType = z.infer<
  typeof PaymentVerificationResponse
>;
