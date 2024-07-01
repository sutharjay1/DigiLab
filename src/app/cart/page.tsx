"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Razorpay from "razorpay";
import Cookies from "js-cookie";
import { getPayloadClient } from "../../get-payload";
import { useCookies } from "next-client-cookies";
import jwt from "jsonwebtoken";
import { RazorpayHeaders } from "razorpay/dist/types/api";
import {
  RazorpayVerifyPayment,
  RazorpayVerifyPaymentLink,
  RazorpayWebhook,
} from "razorpay/dist/utils/razorpay-utils";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

interface IUser {
  _id: string;
  email: string;
  name: string;
}

const Page = () => {
  const { items, removeItem } = useCart();

  const router = useRouter();

  // const { mutate: createCheckoutSession, isLoading } =
  //   trpc.payment.createSession.useMutation({
  //     onSuccess: ({ url }) => {
  //       if (url) router.push(url)
  //     },
  //   })

  const productIds = items.map(({ product }) => product.id);

  const cookies = useCookies();

  const [user, setUser] = useState<IUser>();

  const token = cookies.get("payload-token");

  useEffect(() => {
    if (token) {
      const decoded: any = jwt.decode(token);
      setUser(decoded);
      console.log(JSON.stringify(decoded, null, 2));
    }
  }, [token]);

  // useEffect(() => {
  //   const getUser = async () => {
  //     const payload = await getPayloadClient({
  //       initOptions: {
  //         secret: process.env.PAYLOAD_SECRET,
  //       },
  //     });

  //   };
  // }, []);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartTotal = items.reduce(
    (total, { product }) => total + product.price,
    0
  );

  const fee = 9.8;

  const totalPrice = formatPrice(cartTotal + fee);

  // const [order, setOrder] = useState<any>();

  const { mutate: paymentVerify, isLoading: isPaymentVerifying } =
    trpc.paymentVerify.useMutation({
      onSuccess: ({ message, isOk }) => {
        console.log(message, isOk);
        toast.success(`${message} - ${isOk ? "Success" : "Failed"}`);
      },
    });

  const { mutate: createOrder, isLoading } = trpc.payment.useMutation({
    onSuccess: ({ order }) => {
      const options = {
        key: process.env.RAZORPAY_KEY_ID!,
        name: user?.name,
        currency: "INR",
        amount: order.amount,
        order_id: order.id,
        description: items[0].product.description,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        handler: function (response: any) {
          paymentVerify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderCreationId: order.id,
          });
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.success", function (response: any) {
        console.log("payment success", response);
      });

      paymentObject.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
    },
    onError: (error) => {
      toast.error("Failed to initiate payment. Please try again.");
    },
  });

  const handleCheckout = async () => {
    await initializeRazorpay();
    Number(totalPrice);
    createOrder({
      amount: totalPrice,
      currency: "INR",
    });
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  return (
    <div className="">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-14 sm:pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Shopping Cart
        </h1>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div
            className={cn("lg:col-span-7", {
              "rounded-lg border-[1.2px] border-dashed  dark:border-zinc-200/30 border-zinc-400 p-12":
                isMounted && items.length === 0,
            })}
          >
            <h2 className="sr-only">Items in your shopping cart</h2>

            {isMounted && items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div
                  aria-hidden="true"
                  className="relative mb-4 h-40 w-40 text-muted-foreground"
                >
                  <Image
                    src="/not-found-light.svg"
                    fill
                    alt="empty shopping cart hippo"
                    draggable="false"
                    className="dark:hidden"
                  />
                  <Image
                    src="/not-found-dark.svg"
                    fill
                    alt="empty shopping cart hippo"
                    draggable="false"
                    className="hidden dark:block"
                  />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center">
                  Whoops! Nothing to show here yet.
                </p>
              </div>
            ) : null}

            {!isMounted && items.length === 0 ? (
              <div className="flex py-6">
                <div className="flex flex-shrink-0">
                  <div className="relative h-24 w-24">
                    <Skeleton className="h-full w-full dark:bg-zinc-800/50 bg-zinc-200" />
                  </div>
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div className="flex flex-col justify-between space-y-2">
                      <Skeleton className="h-3 w-full dark:bg-zinc-800/50 bg-zinc-200" />
                      <Skeleton className="h-3 w-full dark:bg-zinc-800/50 bg-zinc-200" />
                      <Skeleton className="h-3 w-full dark:bg-zinc-800/50 bg-zinc-200" />
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                      <div className="absolute right-0 top-0">
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full dark:bg-zinc-800/50 bg-zinc-200" />
                </div>
              </div>
            ) : null}

            <ul
              className={cn({
                "divide-y divide-zinc-200 border-b border-t border-zinc-200":
                  isMounted && items.length > 0,
              })}
            >
              {isMounted &&
                items.map(({ product }) => {
                  const label = PRODUCT_CATEGORIES.find(
                    (c) => c.value === product.category
                  )?.label;

                  const { image } = product.images[0];

                  return (
                    <li key={product.id} className="flex py-6">
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-24">
                          {typeof image !== "string" && image.url ? (
                            <Image
                              fill
                              src={image.url}
                              alt="product image"
                              className="h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48"
                            />
                          ) : null}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link
                                  href={`/product/${product.id}`}
                                  className="font-medium text-zinc-700 hover:text-zinc-800 dark:text-zinc-200 dark:hover:text-zinc-100"
                                >
                                  {product.name}
                                </Link>
                              </h3>
                            </div>

                            <div className="mt-1 flex text-sm">
                              <p className="text-muted-foreground">
                                Category: {label}
                              </p>
                            </div>

                            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                            <div className="absolute right-0 top-0">
                              <Button
                                aria-label="remove product"
                                onClick={() => removeItem(product.id)}
                                variant="ghost"
                              >
                                <X className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 flex space-x-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400" />

                          <span>Eligible for instant delivery</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <section
            className={cn(
              "mt-8 rounded-lg border-[0.5px] border-zinc-200 dark:border-zinc-200/20 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            )}
          >
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Subtotal
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {isMounted ? (
                    formatPrice(cartTotal)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between border-t-[0.5px] border-zinc-300 dark:border-zinc-200/40 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Flat Transaction Fee</span>
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {isMounted ? (
                    formatPrice(fee)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t-[0.5px] border-zinc-300 dark:border-zinc-200/40 pt-4">
                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  Order Total
                </div>
                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {isMounted ? (
                    formatPrice(cartTotal + fee)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                // disabled={items.length === 0 || isLoading}
                // onClick={() => createCheckoutSession({ productIds })}
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                Checkout
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : null}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Page;
