import { initTRPC } from "@trpc/server";
import { publicProcedure, router } from "./trpc";
import { NextResponse } from "next/server";
import { authRouter } from "./authRouter";

export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
