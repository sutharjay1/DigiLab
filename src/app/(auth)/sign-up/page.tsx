"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validator/schema";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  });

  // const { data } = trpc.anyApiRoute.useQuery();
  // console.log(data);
  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: ({success, sentToEmail}) => {
      console.log(success, sentToEmail)
      toast.success(`Verification email sent to ${sentToEmail}.`);
      // router.push("/verify-email?to=" + sentToEmail);
    },
  });

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    mutate({ email, password });
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {" "}
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icons.Logo className="h-20 w-20" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>

            <Link
              className={buttonVariants({
                variant: "link",
                className: "gap-1.5",
              })}
              href="/sign-in"
            >
              Already have an account? Sign-in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid lg:grid-flow-col items-center gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <div>
                    <Input
                      {...register("email")}
                      className={cn("min-w-56", {
                        "focus-visible:ring-red-600": errors.email,
                      })}
                      placeholder="you@example.com"
                    />
                    {errors?.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid lg:grid-flow-col items-center gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <div>
                    <Input
                      {...register("password")}
                      type="password"
                      className={cn("min-w-60", {
                        "focus-visible:ring-red-600": errors.password,
                      })}
                      placeholder="Password"
                    />
                    {errors?.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button>Sign up</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
